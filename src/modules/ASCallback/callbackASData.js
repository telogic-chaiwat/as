module.exports.NAME = async function(req, res, next) {
  const headersReqSchema = this.utils().
      schemas('req.callbackASDataSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.callbackASDataSchema.bodySchema');
  const validateToken = this.utils().submodules('validateToken').
      modules('validateToken');
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

  const appName = this.appName || 'publicIdp';
  const nodeCmd = 'callback_as_response';
  const identity = req.body.reference_id || '';

  this.commonLog(req, nodeCmd, identity);

  let responseError = await validateHeader(appName, nodeCmd, headersReqSchema);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    return;
  }

  responseError = await validateToken(appName, nodeCmd);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    return;
  }

  responseError = await validateBody(appName, nodeCmd, bodyReqSchema);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    return;
  }

  this.stat(appName+' received '+nodeCmd+' request');
  this.summary().addSuccessBlock('client', nodeCmd, null, 'success');

  body = {
    'requestReferenceId': req.body.reference_id,
    'status': 'as_completed',
  };
  checkResp = await identityServiceStatus(body);
  if (this.utils().http().isError(checkResp)) {
    this.stat(appName+' returned '+nodeCmd+' '+'system error');
    const resp = buildResponse(status.SYSTEM_ERROR);
    res.status(resp.status).send();
    return;
  }
  if (checkResp.status && checkResp.status != 200 && checkResp.status != 204) {
    this.stat(appName+' returned '+nodeCmd+' '+'system error');
    const resp = buildResponse(status.SYSTEM_ERROR);
    res.status(resp.status).send();
    return;
  }
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
  res.status(204).send();
  this.stat(appName+' returned '+nodeCmd+' '+'success');
};


