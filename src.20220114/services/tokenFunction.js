/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

const tokens = {};


module.exports.initGetToken = async function(service, node) {
  const axios = require('axios');
  const configEnv = (process.env.service)?JSON.parse(process.env.service ):null;
  const configNode = configEnv[service]?configEnv[service][node]:null;
  if (configNode == null) {
    this.debug(`config not found : service : ${service} node : ${node}`);
    return;
  }
  const url = configNode.conn_type +'://' + configNode.ip +
            (configNode.port ? (':' + configNode.port) : '') +
            configNode.path;
  this.debug(url);
  const config = {
    url: url,
    method: 'POST',
    headers: {
      'content-length': 0,
    },
    auth: {
      username: configNode.name,
      password: configNode.pass,
    },
  };

  try {
    const response = await axios(config);
    this.debug(`success get token from ${service} ${node}`);
    Object.assign(tokens, {
      [service]: response.data.resultData[0],

    });
    // this.debug(tokens);
  } catch (err) {
    if (err.response) {
      this.debug(`failed to get token[${service}][${node}], received status : ` + err.response.status);
    } else if (err.request) {
      this.error(`failed to get token[${service}][${node}], message :` + err.message);
    } else {
      this.error(`failed to get token[${service}][${node}], message :` + err.message);
    }
    Object.assign(tokens, {
      [service]: {},

    });
  }
};

module.exports.sendRefreshToken =async function(service, result, optionAttribut) {
  const nodeName = 'refresh_token';

  const tokens = this.utils().services('tokenFunction').
      modules('tokens');
  const createHttpsAgent = this.utils().submodules('createHttpsAgent')
      .modules('createHttpsAgent');

  const headers = {
    'content-type': 'application/json',
    'authorization': tokens[service].tokenType + ' '+tokens[service].accessToken || '',
  };

  const body = {
    'refreshToken': tokens[service].refreshToken,
  };
  const configRefreshToken = {
    method: 'POST',
    headers: headers,
    _service: service,
    _command: nodeName,
    data: body,
  };
  Object.assign(configRefreshToken,
      {httpsAgent: createHttpsAgent(service, nodeName)});

  const response = await this.utils().http().request(configRefreshToken);

  if ((this.utils().http().isError(response)) || (typeof response == 'undefined')) {
    return result;
  }
  if (response.status && response.status != 200) {
    const errorDesc = (response.status==404)?'data not found':
      (response.status==403 || response.status==401)?'unauthorized':
      (response.status==500)?'system error':
      'other error';
    this.stat(this.appName+' recv '+ service+' '+' error response');
    this.summary().addErrorBlock(service, nodeName,
        response.status, errorDesc);
    return result;
  } else if (response && response.status == 200) {
    this.stat(this.appName+' recv '+service+' '+nodeName+' response');
    this.summary().addErrorBlock(service, nodeName,
        response.status, 'success');

    if (response.data.resultData && Array.isArray(response.data.resultData)) {
      Object.assign(tokens, {
        [service]: response.data.resultData[0],
      });
    } else {
      this.debug('failed refresh token service : ' + service+ ', node: ' + nodeName);
      return result;
    }

    optionAttribut.headers.Authorization = tokens[service].tokenType + ' ' + tokens[service].accessToken;
    result = await this.utils().http().request(optionAttribut);
    return;
  } else {
    this.stat(this.appName+' recv '+service+' '+nodeName+' error response');
    this.summary().addErrorBlock(service, nodeName,
        'error', 'error');
    return result;
  }
};

async function sendGetToken(service, result = null,
    optionAttribut = null) {
  const nodeName = 'getToken';
  const confGetToken = this.utils().services(service)
      .conf(nodeName);
  const tokens = this.utils().services('tokenFunction').
      modules('tokens');
  const createHttpsAgent = this.utils().submodules('createHttpsAgent')
      .modules('createHttpsAgent');

  if (!(confGetToken)) {
    this.debug('failed to get config for get token '+ service);
  }

  const headers = {
    'content-type': 'application/json',
  };

  try {
    const username = confGetToken?confGetToken.name:'';
    const pass = confGetToken?confGetToken.pass:'';
    const auth = 'Basic ' + Buffer.from(`${username}:${pass}`).toString('base64');
    Object.assign(headers, {
      authorization: auth,
    });
  } catch (err) {
    this.debug('error whle encode pass and user');
  }
  const configGetToken = {
    method: 'POST',
    headers: headers,
    _service: service,
    _command: nodeName,
    // auth: {
    //  username: confGetToken?confGetToken.name:'',
    //  password: confGetToken?confGetToken.pass:'',
    // },
  };
  Object.assign(configGetToken,
      {httpsAgent: createHttpsAgent(service, nodeName)});

  const response = await this.utils().http().request(configGetToken);

  if ((this.utils().http().isError(response)) || (typeof response == 'undefined')) {
    return result;
  }
  if (response.status && response.status != 200) {
    const errorDesc = (response.status==404)?'data not found':
      (response.status==403 || response.status==401)?'unauthorized':
      (response.status==500)?'system error':
      'other error';
    this.stat(this.appName+' recv '+ service+' '+' error response');
    this.summary().addErrorBlock(service, nodeName,
        response.status, errorDesc);
    return result;
  } else if (response && response.status == 200) {
    this.stat(this.appName+' recv '+service+' '+nodeName+' response');
    this.summary().addSuccessBlock(service, nodeName,
        response.status, 'success');

    if (response.data.resultData && Array.isArray(response.data.resultData)) {
      Object.assign(tokens, {
        [service]: response.data.resultData[0],
      });
    } else {
      this.debug('received error get token service : ' + service+ ', node: ' + nodeName);
      return result;
    }
    if (optionAttribut != null) {
      optionAttribut.headers.Authorization = tokens[service].tokenType + ' ' + tokens[service].accessToken;
      result = await this.utils().http().request(optionAttribut);
    }
    return result;
  } else {
    this.stat(this.appName+' recv '+service+' '+nodeName+' error response');
    this.summary().addErrorBlock(service, nodeName,
        'error', 'error');
    return result;
  }
};

module.exports.sendGetToken = sendGetToken;

module.exports.serviceGetToken = async function() {
  const servicesNode = ['pidp', 'enroll'];

  const detaillog = this.detail('invoke', 'getToken', 'identity');
  this.summary('invoke', 'getToken', 'identity');
  detaillog.addInputRequest('client', 'getToken', 'invoke',
      'rawdata', 'data', 'protokol', 'method');
  detaillog.Input.pop();

  for (let i = 0; i< servicesNode.length; i++) {
    // const cmd = (mappingCmd[servicesNode[i]])?mappingCmd[servicesNode[i]]:
    //              'get_token';
    await sendGetToken.call(this, servicesNode[i]);

    if (i == servicesNode.length-1) {
      this.summary().end();
      this.detail().end();
    }
  }
};

module.exports.tokens = tokens;
