/* eslint-disable camelcase */
module.exports.sendAsError = async function(data) {
  const createHttpsAgent = this.utils().submodules('createHttpsAgent')
      .modules('createHttpsAgent');
  const generateXTid = this.utils().services('basicFunction')
      .modules('generateXTid');
  const generateJWT = this.utils().submodules('generateJWT')
      .modules('generateJWT');
  // const randomstring = require('randomstring');

  /* const randomstringHex = () => {
    return randomstring.generate({
      charset: 'hex',
    });
  };*/

  const appName = this.appName || 'as';
  const serviceNotif = 'as';
  const nodeNotif = 'as_error';
  const accToken = await generateJWT();
  const initInvoke = this.detail().InitInvoke || generateXTid('ndid');

  const conf_as_data = this.utils().services(serviceNotif)
      .conf(nodeNotif);

  const headers = {
    'Content-Type': 'application/json',
    'X-Tid': initInvoke,
    'Authorization': 'Bearer ' + accToken,
  };

  let callbackURL = conf_as_data.callback_url;

  if (!(callbackURL )) {
    // cannot fine value for callbackURL
    this.debug('use default url callback to send error response');
    const configNDID = JSON.parse(process.env.server);
    callbackURL = (configNDID.use_https?'https':'http') +
          '://' + configNDID.app_host +
          (configNDID.app_port ? (':' + configNDID.app_port) : '') +
          '/as/data';
  }

  let url_as_data = conf_as_data.conn_type + '://' + conf_as_data.ip + (conf_as_data.port ? (':' + conf_as_data.port) : '') + conf_as_data.path;
  url_as_data = url_as_data
      .replace(':request_id', this.req.body.request_id)
      .replace(':service_id', this.req.body.service_id);

  let referenceId = '';
  if (data) {
    referenceId = data.reference_id;
  }
  const optionAttribut = {
    method: 'POST',
    headers: headers,
    _service: serviceNotif,
    _command: nodeNotif,
    data: {
      'reference_id': referenceId,
      'callback_url': callbackURL,
      'error_code': 40000,
    },
    url: url_as_data,
  };

  /*
  if (body.urlCustom) {
    // eslint-disable-next-line max-len
    if (conf_as_data.custom_endpoint && conf_as_data.custom_endpoint[body.url]){
      Object.assign(optionAttribut,
          {
            url: conf_as_data[body.url],
          });
    }
  }*/

  Object.assign(optionAttribut,
      {httpsAgent: createHttpsAgent(serviceNotif, nodeNotif)});

  const getResponse = await this.utils().http().request(optionAttribut);
  // check http response
  if (this.utils().http().isError(getResponse)) {
    // this.stat(appName+' returned '+nodeCmd+' system error');
  } else if (getResponse.status != 202) {
    // eslint-disable-next-line max-len
    this.stat(appName+' recv '+serviceNotif+' '+nodeNotif+ ' error system');
    const errorDesc = 'system error';
    this.summary().addErrorBlock(serviceNotif, nodeNotif,
        getResponse.status, errorDesc);
    // this.stat(appName+' returned '+nodeCmd+' error system');
  } else {
    this.stat(appName+' recv '+serviceNotif+' '+nodeNotif + ' response');
    this.summary().addErrorBlock(serviceNotif, nodeNotif,
        getResponse.status, 'success');
  }
  return getResponse;
};


