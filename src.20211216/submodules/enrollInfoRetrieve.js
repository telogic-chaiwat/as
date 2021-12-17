module.exports.enrollInfoRetrieve = async function(data) {
  const tokens = this.utils().services('tokenFunction').
      modules('tokens');
  const sendGetToken = this.utils().services('tokenFunction').
      modules('sendGetToken');
  const createHttpsAgent = this.utils().submodules('createHttpsAgent')
      .modules('createHttpsAgent');

  const node = 'enrollmentInfoRetrieve';
  const service = 'enroll';
  const appName = this.appName;
  let accessToken = {
    tokenType: 'Bearer',
    accessToken: '',
  };
  if (tokens[service] && tokens[service].accessToken) {
    accessToken = tokens[service];
  } else {
    this.debug('cannot find access token to ' + service);
  }

  const headers = {
    'content-type': 'application/json',
    // eslint-disable-next-line max-len
    'authorization': accessToken.tokenType + ' ' + accessToken.accessToken,
  };

  const identifier = data?(data.identifier?data.identifier:
                              this.req.body.identifier):
                                this.req.body.identifier;
  const body = {
    'id_card': identifier,
    'requester': 'AIS',
    'info_type': 'text',
  };

  const optionAttribut = {
    method: 'POST',
    headers: headers,
    _service: service,
    _command: node,
    data: body,
  };
  Object.assign(optionAttribut,
      {httpsAgent: createHttpsAgent(service, node)});

  const response = await this.utils().http().request(optionAttribut);

  if (this.utils().http().isError(response)) {
    // await returnError(status.SYSTEM_ERROR);
    return response;
  }
  if ( (typeof response != 'string') &&
            response.status && response.status == 401) {
    this.stat(appName+' recv '+service+' '+
          node+' error system');
    this.summary().addErrorBlock(service, node,
        response.status, 'unauthorized');
    await sendGetToken(service, response,
        optionAttribut);
  }

  if (this.utils().http().isError(response)) {
    return response;
  }

  if (response && response.status == 200) {
    // data not founc developer_message == 20020
    if (response.data && response.data.resultCode == '20020') {
      this.stat(appName+' recv '+service+' '+node+' error not_found');
      this.summary().addErrorBlock(service, node,
          response.status, 'data_not_found');
    } else {
      this.stat(appName+' recv '+service+' '+node+' response');
      this.summary().addErrorBlock(service, node,
          response.status, 'success');
    }
  } else if (response && response.status != 404) {
    const descError = (response.status ==401)?'unauthorized':
      'other error';
    this.stat(appName+' recv '+service+' '+
            node+' error system');
    this.summary().addErrorBlock(service, node,
        response.status, descError);
  } else {
    this.stat(appName+' recv '+service+' '+node+' error not_found');
    this.summary().addErrorBlock(service, node,
        response.status, 'data_not_found');
  }
  return response;
};
