module.exports.NAME = async function(req, res, next) {
  const headersReqSchema = this.utils().
      schemas('req.callbackASDataSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.callbackASDataSchema.bodySchema');
  // const validateToken = this.utils().submodules('validateToken').
  //    modules('validateToken');
  const validateHeader = this.utils().submodules('validateHeader').
      modules('validateHeader');
  const validateBody = this.utils().submodules('validateBody').
      modules('validateBody');
  const status = this.utils().services('enum').
      modules('status');
  const buildResponse = this.utils().submodules('buildResponse')
      .modules('buildResponse');
  const identityServiceStatus = this.utils().submodules('IdentityServiceStatus')
      .modules('identityServiceStatus');
  const mongoUpdate = this.utils().services('mongoFunction').
      modules('update');
  const collectionName = this.utils().services('enum')
      .modules('collectionMongo');
  const confMongo = this.utils().services('mongo')
      .conf('default');
  const AIS_IDP_NODE_ID = this.utils().app().const('AIS_IDP_NODE_ID');

  const appName = this.appName || 'publicIdp';
  const nodeCmd = 'callback_as_response';
  const identity = req.body.reference_id || '';
  const initInvoke = req.invoke;
  this.commonLogAsync(req, nodeCmd, identity);

  let responseError = await validateHeader(appName, nodeCmd, headersReqSchema,
      'content-type');
  if (responseError) {
    const response = buildResponse(status.BAD_REQUEST);
    res.status(response.status).send();
    await this.waitFinished();
    this.detail().end();
    this.summary().endASync();
    return;
  }

  /* responseError = await validateToken(appName, nodeCmd);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    return;
  }
*/
  responseError = await validateBody(appName, nodeCmd, bodyReqSchema);
  if (responseError) {
    const response = buildResponse(status.BAD_REQUEST);
    res.status(response.status).send();
    await this.waitFinished();
    this.detail().end();
    this.summary().endASync();
    return;
  }

  this.stat(appName+' received '+nodeCmd+' request');
  this.summary().addSuccessBlock('client', nodeCmd, null, 'success');
  res.status(204).send();
  this.stat(appName+' returned '+nodeCmd+' '+'success');
  await this.waitFinished();

  let belongToAIS = false;
  if (AIS_IDP_NODE_ID && Array.isArray(AIS_IDP_NODE_ID)) {
    belongToAIS = AIS_IDP_NODE_ID.includes(req.body.node_id);
  } else {
    this.error('AIS_IDP_NODE_ID is not found in config file');
  }
  // UPDATE TRANSACTION
  const optionAttributUpdate = {
    collection: collectionName.AS_TRANSACTION,
    commandName: 'update_as_transaction',
    invoke: initInvoke,
    selector: {
      'reference_id': req.body.reference_id,
    },
    update: {
      $set: {
        'status': 'as_completed',
      },
    },
    max_retry: confMongo.max_retry,
    timeout: (confMongo.timeout * 1000),
    retry_condition: confMongo.retry_condition,
  };

  const resultUpdate = await mongoUpdate(this, optionAttributUpdate);
  // ERROR:update MCTransaction fail
  if (!resultUpdate || (resultUpdate &&
    resultUpdate == 'error')) {
    this.error('error while update as transaction');
    this.detail().end();
    this.summary().endASync();
    return;
  }

  // SEND TO SERVICE STATUS
  if (belongToAIS) {
    body = {
      'requestReferenceId': req.body.reference_id,
      'status': 'as_completed',
    };
    checkResp = await identityServiceStatus(body);
    /* if (this.utils().http().isError(checkResp)) {
      return;
    }
    // eslint-disable-next-line max-len
    if (checkResp.status && checkResp.status != 200 && checkResp.status!= 204) {
      return;
    }*/
  }
  this.detail().end();
  this.summary().endASync();

  /*
  const newStatus = (req.body.success)?'completed':'fail';
  const optionAttributUpdate = {
    collection: collectionName.TRANSACTION,
    commandName: 'update_pidp_transaction',
    invoke: initInvoke,
    selector: {'request_id': req.body.request_id},
    sort: {'request_at': -1},
    update: {
      $set: {'status': newStatus, 'serviceOutputValue': ''},
    },
    max_retry: confMongo.max_retry,
    timeout: (confMongo.timeout * 1000),
    retry_condition: confMongo.retry_condition,
  };

  // eslint-disable-next-line max-len
  const mcTransactionUpdate = await findAndModify(this, optionAttributUpdate);
  if (mcTransactionUpdate && mcTransactionUpdate == 'error') {
    this.stat(appName+' returned '+nodeCmd+' '+'system error');
    const resp = buildResponse(status.SYSTEM_ERROR);
    res.status(resp.status).send();
    return;
  }
  if (mcTransactionUpdate.n == 0) {
    this.stat(appName+' returned '+nodeCmd+' '+'error');
    const resp = buildResponse(status.DATA_NOT_FOUND);
    res.status(resp.status).send();
    return;
  }
  */
};


