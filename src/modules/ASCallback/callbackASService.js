/* eslint-disable camelcase */
module.exports.NAME = async function(req, res, next) {
  const headersReqSchema = this.utils().
      schemas('req.callbackASServiceSchema.headersSchema');
  const bodyReqSchema = this.utils().
      schemas('req.callbackASServiceSchema.bodySchema');
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
  const generateJWT = this.utils().submodules('generateJWT')
      .modules('generateJWT');
  const createHttpsAgent = this.utils().submodules('createHttpsAgent')
      .modules('createHttpsAgent');
  const enrollInfoRetrieve = this.utils().submodules('enrollInfoRetrieve')
      .modules('enrollInfoRetrieve');
  const identityServiceStatus = this.utils().submodules('IdentityServiceStatus')
      .modules('identityServiceStatus');
  const sendAsError = this.utils().submodules('sendAsError')
      .modules('sendAsError');
  const mongoInsert = this.utils().services('mongoFunction').
      modules('insert');
  const mongoUpdate = this.utils().services('mongoFunction').
      modules('update');
  const collectionName = this.utils().services('enum')
      .modules('collectionMongo');
  const confMongo = this.utils().services('mongo')
      .conf('default');
  const generateRandomString = this.utils().services('basicFunction').
      modules('generateRandomString');
  const AIS_IDP_NODE_ID = this.utils().app().const('AIS_IDP_NODE_ID');

  // init detail and summary log
  const appName = this.appName || 'as';
  const nodeCmd = 'callback_as_service';
  const identity = req.body.request_id || '';
  const initInvoke = req.invoke;
  this.commonLogAsync(req, nodeCmd, identity);

  /* const returnError = async (statusRes=status.SYSTEM_ERROR) =>{
    if (statusRes == status.SYSTEM_ERROR) {
      this.stat(appName+' returned '+nodeCmd+' '+'system error');
    } else {
      this.stat(appName+' returned '+nodeCmd+' '+'error');
    }
    const resp = buildResponse(statusRes);
    if (res.writableFinished == false) {
      res.status(resp.status).send(resp.body);
      await this.waitFinished();
    }

    this.detail().end();
    this.summary().endASync();
    return;
  };
*/
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
  /*
  responseError = await validateToken(appName, nodeCmd);
  if (responseError) {
    res.status(responseError.status).send(responseError.body);
    await this.waitFinished();
    this.detail().end();
    this.summary().endASync();
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

  // success validation input
  this.stat(appName+' received '+nodeCmd+' request');
  this.summary().addSuccessBlock('client', nodeCmd, null, 'success');

  /*
  const optionAttribut = {
    collection: collectionName.TRANSACTION,
    commandName: 'find_pidp_transaction',
    invoke: initInvoke,
    query: {
      'request_id': req.body.request_id,
      'citizen_id': req.body.identifier,
      'serviceName': req.body.service_id,
      'status': 'wait_for_as',
    },
    options: {
      projection: {
        requestReferenceId: 1,
        serviceOutputValue: 1,
        customerReferenceId: 1,
        confirmCode: 1,
      },
    },
    max_retry: confMongo.max_retry,
    timeout: (confMongo.timeout * 1000),
    retry_condition: confMongo.retry_condition || 'CONNECTION_ERROR|TIMEOUT',
  };

  const mcTransactionFindOne = await mongoFindOne(this, optionAttribut);

  if (mcTransactionFindOne && mcTransactionFindOne == 'error') {
    await returnError(status.SYSTEM_ERROR);
    return;
  }

  let sendToErrorResponse = false;

  if (!(mcTransactionFindOne)) {
    sendToErrorResponse = true;
  }

  if (sendToErrorResponse == false) {
    const optionAttributUpdate = {
      collection: collectionName.TRANSACTION,
      commandName: 'update_pidp_transaction',
      invoke: initInvoke,
      selector: {
        'requestReferenceId': mcTransactionFindOne.requestReferenceId,
      },
      update: {
        $set: {'status': 'prepare_data'},
      },
      max_retry: confMongo.max_retry,
      timeout: (confMongo.timeout * 1000),
      retry_condition: confMongo.retry_condition,
    };

    const mcTransactionUpdate = await mongoUpdate(this, optionAttributUpdate);
    // ERROR:update MCTransaction fail
    if (!mcTransactionUpdate || (mcTransactionUpdate &&
        mcTransactionUpdate == 'error')) {
      await returnError(status.SYSTEM_ERROR);
      return;
    }
    // ERROR:update MCTransaction fail data not found
    if (mcTransactionUpdate.n == 0) {
      await returnError(status.DATA_NOT_FOUND);
      return;
    }
  }
  */

  // SEND RESPONSE TO CLIENT 204
  const resultNDID = {
    HTTP_STATUS: 204,
    DEVELOPER_MESSAGE: 'Acknowledged',
    RESULT_CODE: '204',
  };

  this.stat(appName+' returned '+nodeCmd+' '+'success');
  const successResponse = buildResponse(resultNDID);
  res.status(successResponse.status).send(successResponse.body);
  await this.waitFinished();
  statusRespLast = resultNDID;


  // NEW REQ 10-01-2022 DOING INSERT AS_TRANSACTION
  // eslint-disable-next-line prefer-const
  let requestReferenceId = generateRandomString();
  const doc = req.body;
  Object.assign(doc, {
    reference_id: requestReferenceId,
    creation_time: Date.now(),
  });
  const optionAttributInsert = {
    collection: collectionName.AS_TRANSACTION,
    commandName: 'insert_as_transaction',
    invoke: initInvoke,
    doc: doc,
    max_retry: confMongo.max_retry,
    timeout: (confMongo.timeout * 1000),
    retry_condition: confMongo.retry_condition,
  };

  const mongoResponseInsert = await mongoInsert(this, optionAttributInsert);
  if (mongoResponseInsert && mongoResponseInsert == 'error') {
    this.error('error insert AS Transaction');
  }

  // CHECK NODE_ID
  let belongToAIS = false;
  if (AIS_IDP_NODE_ID && Array.isArray(AIS_IDP_NODE_ID)) {
    belongToAIS = AIS_IDP_NODE_ID.includes(req.body.node_id);
  } else {
    this.error('AIS_IDP_NODE_ID is not found in config file');
  }
  const serviceId = req.body.service_id;
  // NEW REQ 01-11-2021 PHASE TWO : SEND IDENTITY SERVICE STATUS
  //* * ***************** PIDP IDENTITY SERVICE STATUS 1 *********************/
  if (belongToAIS) {
    let asError = false;
    const statusRespLast = status.SYSTEM_ERROR;
    const body = {
      'identifier': req.body.identifier,
      'requestId': req.body.request_id,
      'serviceId': req.body.service_id,
      'status': 'as_prepare_data',
    };
    const checkResp = await identityServiceStatus(body);
    if (this.utils().http().isError(checkResp)) {
      await sendAsError({
        reference_id: requestReferenceId,
      });
      asError = true;
    }
    // eslint-disable-next-line max-len
    if (checkResp.status && checkResp.status != 200 && checkResp.status != 204) {
      await sendAsError({
        reference_id: requestReferenceId,
      });
      asError = true;
    }

    if (asError) {
      const transResCode = statusRespLast.RESULT_CODE;
      const transResDesc = statusRespLast.DEVELOPER_MESSAGE;
      this.summary().endASync(null, null, transResDesc, transResCode);
      this.detail().end();
      return;
    }

    if (checkResp.data && checkResp.data.resultData &&
      Array.isArray(checkResp.data.resultData)) {
      requestReferenceId = checkResp.data.resultData[0].requestReferenceId;
    } else {
      this.log('referenceId is not found on response from identity service');
    }
  }
  //* * ********************** Enrollment Retrieve Data ***********************/

  let statusUpdate = '';
  const infoRetrieve = await enrollInfoRetrieve();
  if (this.utils().http().isError(infoRetrieve)) {
    // const transResCode = status.SYSTEM_ERROR.RESULT_CODE;
    // const transResDesc = status.SYSTEM_ERROR.DEVELOPER_MESSAGE;
    // this.detail().end();
    // this.summary().endASync(null, null, transResDesc, transResCode);
    statusUpdate = 'as_fail_get_data';
  } else if (infoRetrieve.status && infoRetrieve.status != 200 &&
                infoRetrieve.status != 204) {
    // const transResCode = status.SYSTEM_ERROR.RESULT_CODE;
    // const transResDesc = status.SYSTEM_ERROR.DEVELOPER_MESSAGE;
    // this.detail().end();
    // this.summary().endASync(null, null, transResDesc, transResCode);
    statusUpdate = 'as_fail_get_data';
  } else {
    if (infoRetrieve.data && infoRetrieve.data.resultCode == '20020') {
      statusUpdate = 'as_fail_data_not_found';
    } else {
      statusUpdate = 'as_send_data';
    }
  }


  //* * ***************** UPDATE TRANSACTION *********************/
  const optionAttributUpdate = {
    collection: collectionName.AS_TRANSACTION,
    commandName: 'update_as_transaction',
    invoke: initInvoke,
    selector: {
      'request_id': req.body.request_id,
    },
    update: {
      $set: {
        'status': statusUpdate,
        'reference_id': requestReferenceId,
      },
    },
    max_retry: confMongo.max_retry,
    timeout: (confMongo.timeout * 1000),
    retry_condition: confMongo.retry_condition,
  };

  let resultUpdate = await mongoUpdate(this, optionAttributUpdate);
  // ERROR:update MCTransaction fail
  if (!resultUpdate || (resultUpdate &&
    resultUpdate == 'error')) {
    this.error('error while update as transaction');
  }

  //* * ***************** PIDP IDENTITY SERVICE STATUS 2 *********************/

  if (belongToAIS) {
    body = {
      'requestReferenceId': requestReferenceId,
      'status': statusUpdate,
    };
    checkResp = await identityServiceStatus(body);
    if (this.utils().http().isError(checkResp)) {
      await sendAsError({
        reference_id: requestReferenceId,
      });
      const transResCode = statusRespLast.RESULT_CODE;
      const transResDesc = statusRespLast.DEVELOPER_MESSAGE;
      this.summary().endASync(null, null, transResDesc, transResCode);
      this.detail().end();
      return;
    }
    // eslint-disable-next-line max-len
    if (checkResp.status && checkResp.status != 200 && checkResp.status != 204) {
      await sendAsError({
        reference_id: requestReferenceId,
      });
      const transResCode = statusRespLast.RESULT_CODE;
      const transResDesc = statusRespLast.DEVELOPER_MESSAGE;
      this.summary().endASync(null, null, transResDesc, transResCode);
      this.detail().end();
      return;
    }
  }
  if (statusUpdate != 'as_send_data') {
    await sendAsError({
      reference_id: requestReferenceId,
    });
    const transResCode = statusRespLast.RESULT_CODE;
    const transResDesc = statusRespLast.DEVELOPER_MESSAGE;
    this.summary().endASync(null, null, transResDesc, transResCode);
    this.detail().end();
    return;
  }
  /** ************************  ASSendDataToNDID ******************************/
  //
  let transResDesc = status.SUCCESS.RESULT_CODE;
  let transResCode = status.SUCCESS.DEVELOPER_MESSAGE;

  const settings = JSON.parse(process.env.server);
  const callbackUrl = (settings.use_https?'https':'http') +
    '://' + settings.app_host +
    (settings.app_port ? (':' + settings.app_port) : '') +
    '/as/data';

  const commandToNdid = 'as_send_data_to_ndid';
  const paramBody = {
    node_id: req.body.node_id,
    reference_id: requestReferenceId,
    // callback_url: 'http://' + app_host + ':' + app_port + '/as/data',
    callback_url: callbackUrl,
    // data: mcTransactionFindOne.serviceOutputValue || '',
    data: '',
  };

  if (infoRetrieve.data && infoRetrieve.data.resultData &&
    Array.isArray(infoRetrieve.data.resultData)) {
    try {
      const enrollInfo = infoRetrieve.data.resultData[0].enrollmentInfo;
      if (serviceId == '001.cust_info_002') {
        delete enrollInfo.customer_biometric;
      }
      //Modify cust_creted_date
      if(enrollInfo.cust_created_date) {
	      let new_cust_created_date='<3';
	      let diffCustTime=((new Date().getTime())-(new Date(enrollInfo.cust_created_date+""Z+0700").getTime()))/1000/86400;
	      if(!isNaN(diffCustTime)) {
	      	if(diffCustTime>3) new_cust_created_date='>3';
	      }
	      enrollInfo.cust_created_date=new_cust_created_date;
      } else {
	      enrollInfo.cust_created_date='<3';
      }
      // eslint-disable-next-line max-len
      const enrollInfoString = JSON.stringify(enrollInfo);
      Object.assign(paramBody, {
        data: enrollInfoString,
      });
    } catch (err) {
      this.debug('error while stringify enrollment info');
    }
  }
  /*
  if (sendToErrorResponse == false) {
    paramBody = {
      node_id: req.body.node_id,
      reference_id: mcTransactionFindOne.confirmCode,
      // callback_url: 'http://' + app_host + ':' + app_port + '/as/data',
      callback_url: callbackUrl,
      data: mcTransactionFindOne.serviceOutputValue || '',
    };
  } else {
    paramBody = {
      reference_id: req.body.request_id.substr(-8),
      callback_url: callbackUrl,
      error_code: 40300,
    };
    commandToNdid = 'as_send_error_to_ndid';
  }
  */


  //await new Promise(resolve => setTimeout(resolve, 300000)); // for test delay

  const conf_as_data = this.utils().services('as').conf(commandToNdid);

  if (conf_as_data.callback_url) {
    Object.assign(paramBody, {
      callback_url: conf_as_data.callback_url,
    });
  }
  let url_as_data = conf_as_data.conn_type + '://' + conf_as_data.ip +
    (conf_as_data.port ? (':' + conf_as_data.port) : '') + conf_as_data.path;

  url_as_data = url_as_data
      .replace(':request_id', req.body.request_id)
      .replace(':service_id', req.body.service_id);

  this.debug('URL : ' + url_as_data);
  const accToken = await generateJWT();
  const optionAttribute = {};
  optionAttribute.url = url_as_data;
  optionAttribute.method = 'POST';
  optionAttribute.data = paramBody;
  optionAttribute._service = 'as';
  optionAttribute._command = commandToNdid;
  optionAttribute.headers = {
    'Content-Type': 'application/json',
    'X-Tid': initInvoke,
    'Authorization': 'Bearer ' + accToken,
  };

  Object.assign(optionAttribute,
      {httpsAgent: createHttpsAgent(appName, commandToNdid)});

  const response = await this.utils().http().request(optionAttribute);

  if (this.utils().http().isError(response)) {
    // this.debug("axios Auth response: ", response);
    if (response === 'CONNECTION_ERROR') {
      transResCode = status.SERVER_UNAVAILABLE.RESULT_CODE;
      transResDesc = status.SERVER_UNAVAILABLE.DEVELOPER_MESSAGE;
    } else { // TIMEOUT
      transResCode = status.SERVER_BUSY.RESULT_CODE;
      transResDesc = status.SERVER_BUSY.DEVELOPER_MESSAGE;
    }
    this.stat(appName + ' transaction ' + nodeCmd + ' system error');
    // isUpdateSuccess = false
  } else if (response.status != 202) {
    this.log('send data to NDID received status : ' + response.status);
    transResCode = status.SYSTEM_ERROR.RESULT_CODE;
    transResDesc = status.SYSTEM_ERROR.DEVELOPER_MESSAGE;

    // eslint-disable-next-line max-len
    this.stat(appName +' recv as '+optionAttribute._command + ' error response');
    this.stat(appName + ' transaction ' + nodeCmd + ' system error');

    this.summary().addErrorBlock(optionAttribute._service,
        optionAttribute._command,
        'http_status=' + response.status,
        (response.data)? response.data.error:
        (response.status==404)?'http not found':'other error',
    );
    // isUpdateSuccess = false
  } else {
    this.stat(appName + ' recv as ' + optionAttribute._command + ' response');
    this.summary().addSuccessBlock(optionAttribute._service,
        optionAttribute._command, String(response.status), 'success');

    this.stat(appName + ' transaction ' + nodeCmd + ' system success');
    this.summary().endASync(null, null, transResDesc, transResCode);
    this.detail().end();
    return;
  }

  const statusFailed = 'as_fail_send_data';
  //* * ***************** UPDATE TRANSACTION 2 *********************/
  optionAttributUpdate['update']['$set'] = {
    status: statusFailed,
  };
  resultUpdate = await mongoUpdate(this, optionAttributUpdate);
  // ERROR:update MCTransaction fail
  if (!resultUpdate || (resultUpdate &&
    resultUpdate == 'error')) {
    this.error('error while update as transaction');
  }

  // Failed to send as data to NDID
  //* * ***************** PIDP IDENTITY SERVICE STATUS 3 *********************/
  if (belongToAIS) {
    body = {
      'requestReferenceId': requestReferenceId,
      'status': statusFailed,
    };
    checkResp = await identityServiceStatus(body);
  }

  await sendAsError({
    reference_id: requestReferenceId,
  });
  this.stat(appName + ' transaction ' + nodeCmd + ' system error');
  this.detail().end();
  this.summary().endASync(null, null, transResDesc, transResCode);
  return;


  /*
  if (sendToErrorResponse) {
    this.detail().end();
    this.summary().endASync(null, null, transResDesc, transResCode);
    await this.waitFinished();
    return;
  }

  const optionAttributUpdate = {
    collection: collectionName.TRANSACTION,
    commandName: 'update_pidp_transaction',
    invoke: initInvoke,
    selector: {'requestReferenceId': mcTransactionFindOne.requestReferenceId},
    update: {
      $set: {'status': 'send_data', 'serviceOutputValue': ''},
    },
    max_retry: confMongo.max_retry,
    timeout: (confMongo.timeout * 1000),
    retry_condition: confMongo.retry_condition,
  };

  const mcTransactionUpdate = await mongoUpdate(this, optionAttributUpdate);

  if (mcTransactionUpdate && mcTransactionUpdate == 'error') {
    this.stat(appName + ' transaction ' + nodeCmd + ' system error');
    this.detail().end();
    this.summary().endASync(null, null, transResDesc, transResCode);
    return;
  }

  // document is not found
  if (mcTransactionUpdate.n == 0) {
    this.stat(appName + ' transaction ' + nodeCmd + ' system error');
    this.detail().end();
    this.summary().endASync(null, null, transResDesc, transResCode);
    return;
  }
  */
  this.stat(appName + ' transaction ' + nodeCmd + ' system success');
  this.summary().endASync(null, null, transResDesc, transResCode);
  this.detail().end();
  await this.waitFinished();
};

