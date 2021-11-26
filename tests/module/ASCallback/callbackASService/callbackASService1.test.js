
/* eslint-disable max-len */
const request = require('supertest');
const commonlog = require('commonlog-kb');
const dataDummy = require('../../dataDummy');
const mongoUtility = require('../../mongoUtility');
const stat = require('../../stat');
const {collectionMongo} = require('../../enum');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const app = appTest;
const url = '/service/'+dataDummy.serviceId;

const mock = new MockAdapter(axios);
const settings = JSON.parse(process.env.service);
const conf = settings.as.as_send_data_to_ndid;
let urlIdp = conf.conn_type +'://' + conf.ip +
                    (conf.port ? (':' + conf.port) : '') + conf.path;

urlIdp = urlIdp
    .replace(':request_id', dataDummy.requestId1)
    .replace(':service_id', dataDummy.serviceId);


const confError = settings.as.as_send_error_to_ndid;
let urlIdpError = confError.conn_type +'://' + confError.ip +
                    (confError.port ? (':' + confError.port) : '') + confError.path;

urlIdpError = urlIdpError
    .replace(':request_id', dataDummy.requestId1)
    .replace(':service_id', dataDummy.serviceId);

mock.onPost(urlIdp).reply(202);
mock.onPost(urlIdpError).reply(202);

const reqBody = {
  'node_id': '894CFA85-2AC5-4758-A86B-3E12B88F17DF',
  'type': 'data_request',
  'request_id': dataDummy.requestId1,
  'mode': 3,
  'namespace': dataDummy.nameSpace1,
  'identifier': dataDummy.identifier1,
  'service_id': dataDummy.serviceId,
  'request_params': '{"type":"pdf"}',
  'requester_node_id': '17DB668C-155C-4D90-843D-ADAE12D779CC',
  'response_signature_list': [
    'YmFzZTY0X3N0cmluZw==',
  ],
  'max_ial': 2.2,
  'max_aal': 2.2,
  'creation_time': 1533315873764,
  'creation_block_height': 'A02:179791',
  'request_timeout': 600,
};

describe('[1]GOOD FLOW for Callback AS Data', ()=>{
  beforeEach(async () => {

  });

  afterAll(async () =>{
    await mongoUtility.drop(collectionMongo.TRANSACTION);
    await mongoUtility.disconnected();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async ()=>{
    await mongoUtility.connected();
    await mongoUtility.insert(collectionMongo.TRANSACTION, dataDummy.pidpTransactionData1_AS_service);
  });

  test('[CASE 1] find doc transaction', async () => {
    const res = await request(app).post(url)
        .set('Authorization', AuthTokenTest ) // set header for this test
        .set('Content-Type', 'application/json')
        .send(reqBody);

    await new Promise((r) => setTimeout(r, 2000));
    // console.error(commonlog.summary().addBlock.mock.calls);

    // CHECK RESPONSE
    expect(res.status).toBe(204);
    expect(res.text).toBe('');

    // CHECK MONGO
    dataDummy.pidpTransactionData1_AS_service.status = 'send_data';
    const mongoDoc = await mongoUtility.findOne(collectionMongo.TRANSACTION, {request_id: dataDummy.requestId1});
    expect(mongoDoc).toMatchObject(dataDummy.pidpTransactionData1_AS_service);

    // CHECK SUMMARY

    const CMD = 'callback_as_service';
    expect(commonlog.summary).toBeCalledWith(
        expect.anything(),
        expect.anything(), // invoke
        CMD, // cmd
        dataDummy.requestId1); // identity

    expect(commonlog.summary().addBlock).toHaveBeenCalledTimes(5);
    expect(commonlog.summary().addBlock).toBeCalledWith('client', CMD, null, 'success');
    expect(commonlog.summary().addBlock).toBeCalledWith('mongo', 'find_pidp_transaction', '20000', 'success');
    expect(commonlog.summary().addBlock).toBeCalledWith('mongo', 'update_pidp_transaction', '20000', 'success');
    expect(commonlog.summary().addBlock).toBeCalledWith('as', 'as_send_data_to_ndid', '202', 'success');
    expect(commonlog.summary().addBlock).toBeCalledWith('mongo', 'update_pidp_transaction', '20000', 'success');

    // CHECK STAT
    // console.error(commonlog.stat.mock.calls);
    expect(commonlog.stat).toHaveBeenCalledTimes(11);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.SUCCESS_RECEIVED);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.SUCCESS_RETURN);
    expect(commonlog.stat).toBeCalledWith(stat.mongoFindPidpTransaction.SEND);
    expect(commonlog.stat).toBeCalledWith(stat.mongoFindPidpTransaction.RECEIVED_SUCCESS);
    expect(commonlog.stat).toBeCalledWith(stat.mongoUpdatePidpTransaction.SEND);
    expect(commonlog.stat).toBeCalledWith(stat.mongoUpdatePidpTransaction.RECEIVED_SUCCESS);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.SEND_TO_NDID);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.RECEIVED_SUCCESS_TO_NDID);
    expect(commonlog.stat).toBeCalledWith(stat.mongoUpdatePidpTransaction.SEND);
    expect(commonlog.stat).toBeCalledWith(stat.mongoUpdatePidpTransaction.RECEIVED_SUCCESS);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.SUCCESS_TRANSACTION);
  });

  test('[CASE 2] doc transaction is NOT FOUND', async () => {
    await mongoUtility.drop(collectionMongo.TRANSACTION);
    const res = await request(app).post(url)
        .set('Authorization', AuthTokenTest ) // set header for this test
        .set('Content-Type', 'application/json')
        .send(reqBody);

    await new Promise((r) => setTimeout(r, 2000));
    // console.error(commonlog.summary().addBlock.mock.calls);

    // CHECK RESPONSE
    expect(res.status).toBe(204);
    expect(res.text).toBe('');

    // CHECK MONGO
    dataDummy.pidpTransactionData1_AS_service.status = 'send_data';
    const mongoDoc = await mongoUtility.findOne(collectionMongo.TRANSACTION, {request_id: dataDummy.requestId1});
    expect(mongoDoc).toBeNull();

    // CHECK SUMMARY

    const CMD = 'callback_as_service';
    expect(commonlog.summary).toBeCalledWith(
        expect.anything(),
        expect.anything(), // invoke
        CMD, // cmd
        dataDummy.requestId1); // identity

    expect(commonlog.summary().addBlock).toHaveBeenCalledTimes(3);
    expect(commonlog.summary().addBlock).toBeCalledWith('client', CMD, null, 'success');
    expect(commonlog.summary().addBlock).toBeCalledWith('mongo', 'find_pidp_transaction', '40401', 'data not found');
    expect(commonlog.summary().addBlock).toBeCalledWith('as', 'as_send_error_to_ndid', '202', 'success');
    // CHECK STAT
    // console.error(commonlog.stat.mock.calls);
    expect(commonlog.stat).toHaveBeenCalledTimes(6);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.SUCCESS_RECEIVED);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.SUCCESS_RETURN);
    expect(commonlog.stat).toBeCalledWith(stat.mongoFindPidpTransaction.SEND);
    expect(commonlog.stat).toBeCalledWith(stat.mongoFindPidpTransaction.RECEIVED_SUCCESS);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.SEND_TO_NDID_ERROR);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASService.RECEIVED_SUCCESS_TO_NDID_ERROR);
  });
});
