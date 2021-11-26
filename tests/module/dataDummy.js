/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

const encode = (str) =>{
  return Buffer.from(str).toString('base64');
};

const hash = function(str) {
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return hash;
};

module.exports.encode = encode;
module.exports.hash = hash;

const requestId1 = '1b50uu97c0assfefmi46720d40e9fedd83a485c2b1a3b64992093761420b48bb3f576930ad89a85c95600';
const requesterNodeDetail1 = 'testing jest 1';
const requesterNodeDetail2 = 'testing jest 2';
const signature1 = 'test sign 1';
const signature2 = 'test sign 2';
const requesterNodeId1 = '27DB668C-155C-4D90-843D-ADAE12D779CE1';
const requesterNodeId2 = '27DB668C-155C-4D90-843D-2222222222222';
const identifier1 = '1377777776879';
const nameSpace1 = 'citizen_id';
const createAt = '2021-08-15T15:38:20.696Z';
const requestReferenceId1 = '123456789';
const serviceId = '900.cust_info_Dipchip_001';

module.exports.requestId1 = requestId1;
module.exports.requesterNodeDetail1 = requesterNodeDetail1;
module.exports.requesterNodeDetail2 = requesterNodeDetail2;
module.exports.signature1 = signature1;
module.exports.signature2 = signature2;
module.exports.requesterNodeId1 = requesterNodeId1;
module.exports.requesterNodeId2 = requesterNodeId2;
module.exports.identifier1 = identifier1;
module.exports.nameSpace1 = nameSpace1;
module.exports.createAt = createAt;
module.exports.requestReferenceId1 = requestReferenceId1;
module.exports.serviceId = serviceId;

module.exports.identityRequestData1 = {
  'node_id': 'string',
  'type': 'request_status',
  'mode': 1,
  'request_id': requestId1,
  'request_message': 'Would you like to give Siam Comercial Bank your consent to send your information to Krung Thai Bank (REF: 61197)?',
  'request_message_hash': 'string',
  'request_message_salt': 'NL9eeesTLs/roA8GUXzVGA==',
  'requester_node_id': 'string',
  'min_ial': 1.1,
  'min_aal': 1,
  'data_request_list': [
    {
      'service_id': serviceId,
      'as_id_list': [
        'string',
      ],
      'min_as': 0,
      'request_params_hash': 'string',
      'response_list': [
        {
          'as_id': 'string',
          'signed': true,
          'received_data': true,
          'error_code': 0,
        },
      ],
    },
  ],
  'initial_salt': '0VUapcsKVMw2A5LKp2Ntbw==',
  'creation_time': 1730645747656,
  'creation_block_height': 'A02:179791',
  'request_timeout': 500,
  'namespace': nameSpace1,
  'identifier': identifier1,
  'requester_node_detail': 'ndid',
  'signature': 'base64',
  'block_height': 'string',
  'closed': false,
  'idp_id_list': [
    'string',
  ],
  'min_idp': 0,
  'response_list': [
    {
      'ial': 2.3,
      'aal': 2.2,
      'status': 'reject',
      'signature': 'test',
      'idp_id': '3BB7E7E4-3845-4801-9259-C81116ADB3B1',
      'valid_ial': null,
      'valid_signature': null,
    },
  ],
  'status': 'pending',
  'timed_out': false,
};

module.exports.pidpTransactionData1 = {
  'requestReferenceId': '123456789',
  'request_id': requestId1,
  'customerReferenceId': '61197',
  'citizen_id': identifier1,
  'serviceName': serviceId,
  'min_aal': 1,
  'min_ial': 1.1,
  'request_at': new Date(createAt),
  'status': 'pending',
  'timeout': false,
};

module.exports.pidpTransactionData2 = {
  'requestReferenceId': '123456789',
  'request_id': requestId1,
  'customerReferenceId': '61197',
  'citizen_id': identifier1,
  'serviceName': serviceId,
  'min_aal': 1,
  'min_ial': 1.1,
  'request_at': new Date(createAt),
  'status': 'confirmed',
  'timeout': false,
  'channelName': 'AIS Shop',
  'locationCode': 'Central Rama 9',
  'serviceOutputFormat': 'string',
  'serviceOutputValue': 'eyJjYXJkX251bWJlciI6IjEyMzQ1Njc4OTAxMjMifQ==',
  'serviceResultCode': '20000',
  'serviceResultMessage': 'success',
  'userId': 'userA',
};

module.exports.pidpTransactionData1_ASData = {
  'requestReferenceId': '123456789',
  'request_id': requestId1,
  'customerReferenceId': '61197',
  'citizen_id': identifier1,
  'serviceName': '900.cust_info_Dipchip_001',
  'min_aal': 1,
  'min_ial': 1.1,
  'request_at': new Date(createAt),
  'status': 'completed',
  'timeout': false,
  'serviceOutputValue': '',
};

module.exports.pidpTransactionData1_AS_service = {
  'requestReferenceId': '123456789',
  'request_id': requestId1,
  'customerReferenceId': '61197',
  'citizen_id': identifier1,
  'serviceName': serviceId,
  'min_aal': 1,
  'min_ial': 1.1,
  'request_at': new Date(createAt),
  'status': 'wait_for_as',
  'timeout': false,
  'serviceOutputValue': '',
};
