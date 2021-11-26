
/* eslint-disable max-len */
const request = require('supertest');
const commonlog = require('commonlog-kb');
const dataDummy = require('../../dataDummy');
const mongoUtility = require('../../mongoUtility');
const stat = require('../../stat');
const {collectionMongo} = require('../../enum');

const app = appTest;
const url = '/as/data';

const reqBody = {
  'request_id': dataDummy.requestId1,
  'node_id': '894CFA85-2AC5-4758-A86B-3E12B88F17DF',
  'type': 'response_result',
  'reference_id': '123456789',
  'success': true,
  'error': {
    'code': 0,
    'message': 'test',
  },
};

describe('[1]GOOD FLOW for Callback AS Data', ()=>{
  beforeEach(async () => {

  });

  afterAll(async () =>{
    // await mongoUtility.drop(collectionMongo.IDENTITY_REQUEST);
    await mongoUtility.disconnected();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async ()=>{
    await mongoUtility.connected();
    await mongoUtility.insert(collectionMongo.TRANSACTION, dataDummy.pidpTransactionData1);
  });

  test('[CASE 1] case for success ok', async () => {
    const res = await request(app).post(url)
        .set('Authorization', AuthTokenTest ) // set header for this test
        .set('Content-Type', 'application/json')
        .send(reqBody);

    // console.error(commonlog.summary().addBlock.mock.calls);
    // CHECK RESPONSE
    expect(res.status).toBe(204);
    expect(res.text).toBe('');

    // CHECK MONGO
    const mongoDoc = await mongoUtility.findOne(collectionMongo.TRANSACTION, {request_id: dataDummy.requestId1});
    expect(mongoDoc).toMatchObject(dataDummy.pidpTransactionData1_ASData);

    // CHECK SUMMARY

    const CMD = 'callback_as_data';
    expect(commonlog.summary).toBeCalledWith(
        expect.anything(),
        expect.anything(), // invoke
        CMD, // cmd
        dataDummy.requestReferenceId1); // identity

    expect(commonlog.summary().addBlock).toHaveBeenCalledTimes(2);
    expect(commonlog.summary().addBlock).toBeCalledWith('client', CMD, null, 'success');
    expect(commonlog.summary().addBlock).toBeCalledWith('mongo', 'update_pidp_transaction', '20000', 'success');

    // CHECK STAT
    expect(commonlog.stat).toHaveBeenCalledTimes(4);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASData.SUCCESS_RECEIVED);
    expect(commonlog.stat).toBeCalledWith(stat.callbackASData.SUCCESS_RETURN);
    expect(commonlog.stat).toBeCalledWith(stat.mongoUpdatePidpTransaction.SEND);
    expect(commonlog.stat).toBeCalledWith(stat.mongoUpdatePidpTransaction.RECEIVED_SUCCESS);
  });
});
