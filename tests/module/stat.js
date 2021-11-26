/* eslint-disable max-len */
module.exports = Object.freeze({

  'callbackASData': {
    SUCCESS_RECEIVED: 'as received callback_as_data request',
    SYSTEM_ERROR: 'as returned callback_as_data system error',
    RETURN_ERROR: 'as returned callback_as_data error',
    SUCCESS_RETURN: 'as returned callback_as_data success',
  },

  'callbackASService': {
    SUCCESS_RECEIVED: 'as received callback_as_service request',
    SYSTEM_ERROR: 'as returned callback_as_service system error',
    RETURN_ERROR: 'as returned callback_as_service error',
    SUCCESS_RETURN: 'as returned callback_as_service success',
    SEND_TO_NDID: 'as sent as as_send_data_to_ndid request',
    RECEIVED_SUCCESS_TO_NDID: 'as recv as as_send_data_to_ndid response',
    RECEIVED_ERROR_TO_NDID: 'as recv as as_send_data_to_ndid error response',
    SEND_TO_NDID_ERROR: 'as sent as as_send_error_to_ndid request',
    RECEIVED_SUCCESS_TO_NDID_ERROR: 'as recv as as_send_error_to_ndid response',
    RECEIVED_ERROR_TO_NDID_ERROR: 'as recv as as_send_error_to_ndid error response',
    SUCCESS_TRANSACTION: 'as transaction callback_as_service system success',
    ERROR_SYSTEM_TRANSACTION: 'as transaction callback_as_service system error',
  },

  'mongoFindIdpRequest': {
    SEND: 'as sent mongo find_identity_request request',
    RECEIVED_SUCCESS: 'as recv mongo find_identity_request response',
  },

  'mongoInsertIdpRequest': {
    SEND: 'as sent mongo insert_identity_request request',
    RECEIVED_SUCCESS: 'callback_as_data recv mongo insert_identity_request response',
  },

  'mongoUpdateIdpRequest': {
    SEND: 'as sent mongo update_identity_request request',
    RECEIVED_SUCCESS: 'as recv mongo update_identity_request response',
  },

  'mongoInsertPidpTransaction': {
    SEND: 'as sent mongo insert_pidp_transaction request',
    RECEIVED_SUCCESS: 'as recv mongo insert_pidp_transaction response',
  },

  'mongoUpdatePidpTransaction': {
    SEND: 'as sent mongo update_pidp_transaction request',
    RECEIVED_SUCCESS: 'as recv mongo update_pidp_transaction response',
  },
  'mongoFindPidpTransaction': {
    SEND: 'as sent mongo find_pidp_transaction request',
    RECEIVED_SUCCESS: 'as recv mongo find_pidp_transaction response',
  },
});
