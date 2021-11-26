/* eslint-disable max-len */

// //////////// MODIFY THIS PART ///////////////////////////////////////////

const pathIndex = '../../index.js'; // PLEASE UPDATE WITH LOCATION OF INDEX
const setting = require('../../pm2-dev.json'); // PLEASE UPDATE WITH PM2-DEV
global.AuthTokenTest = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMmYyOWM0MjRkZGI4ODE5OTFjMGI2MCIsImtpbmQiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE2MzA3NzQ3NzMsImV4cCI6MTYzMDg2MTE3M30.wvZhXqNGCuaNGW40p5DjZlieSHoDdESqAQSjj3GF5Mo';

const mongoConf = {
  'conn_type': 'mongodb',
  'ip': '0.0.0.0',
  'port': '27017',
  'db': 'test',
  'max_retry': 0,
  'timeout': 4,
  'retry_condition': 'CONNECTION_ERROR',
  'connection_string': {
  },
};

// ///////////////////////////////////////////////////////////////////////////////////
const path = require('path');
const commonlog = require('commonlog-kb');

process.env = setting.apps[0].env;
process.env.service.mongo.default = mongoConf;
module.exports.mongoConf = mongoConf;


// mock commonlog-kb
const detailObj = {
  isRawDataEnabled: jest.fn(),
  addInputRequest: jest.fn(),
  addInputRequestTimeout: jest.fn(),
  addInputResponse: jest.fn(),
  addInputResponseTimeout: jest.fn(),
  addInputResponseError: jest.fn(),
  addOutputRequest: jest.fn(),
  addOutputResponse: jest.fn(),
  addOutputRequestRetry: jest.fn(),
  end: jest.fn(),
  Input: [],
};

const addblock = jest.fn();
const summaryObj ={
  addSuccessBlock: addblock,
  addErrorBlock: addblock,
  endASync: jest.fn(),
  setIdentity: jest.fn(),
  isEnd: jest.fn(),
  end: jest.fn(),
  addBlock: addblock,
};

commonlog.summary = jest.fn();
commonlog.summary.mockReturnValue(summaryObj);
commonlog.detail = ()=>{
  return detailObj;
};

commonlog.debug = jest.fn();
commonlog.log = jest.fn();
commonlog.info = jest.fn();
commonlog.stat = jest.fn();
commonlog.init = jest.fn();

process.env.server = JSON.stringify(process.env.server);
process.env.service = JSON.stringify(process.env.service);
process.env.app = JSON.stringify(process.env.app);
process.env.commonRod = JSON.stringify(process.env.commonRod);
process.env.commonLog = JSON.stringify(process.env.commonLog);


global.indexTestPath = path.resolve(__dirname+'/'+pathIndex);
global.mockFlag = true;
global.mockPath = path.dirname(path.resolve(__dirname+'/'+pathIndex));

global.console = {
  log: jest.fn(), // console.log are ignored in tests
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

global.appTest = require(indexTestPath).server;
