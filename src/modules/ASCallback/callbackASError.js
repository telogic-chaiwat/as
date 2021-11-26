module.exports.NAME = async function(req, res, next) {
  const headersReqSchema = this.utils().
      schemas('req.callbackASErrorSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.callbackASErrorSchema.bodySchema');
  const validateToken = this.utils().submodules('validateToken').
      modules('validateToken');
  const validateHeader = this.utils().submodules('validateHeader').
      modules('validateHeader');
  const validateBody = this.utils().submodules('validateBody').
      modules('validateBody');

  const appName = this.appName || 'as';
  const nodeCmd = 'callback_as_error';
  const identity = req.body.request_id || '';

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

  res.status(204).send();
  this.stat(appName+' returned '+nodeCmd+' '+'success');
};


