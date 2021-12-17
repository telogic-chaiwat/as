/* eslint-disable camelcase */
// require and start immediately
// let app = require('common-rod')();

// OR
const whitelistIp = require('express-ip-access-control');

const commonRodOpt = {
  mongo_create_connect: true,
  detaillog_add_output_response: true,
  summarylog_auto_end: true,
}; // optional

// eslint-disable-next-line camelcase
const cb_BeforeRunServer = async function() {
  const startServer = true;
  const {loadCaCert} = require('./src/services/loadCaCert');
  loadCaCert((process.env.service)?JSON.parse(process.env.service ):null, this);
  // const {initGetToken} = require('./src/services/tokenFunction');
  // initGetToken.call(this, 'myIDS', 'get_token');
  // initGetToken.call(this, 'enroll', 'get_token');
  // initGetToken.call(this, 'as', 'get_token');

  const options = {
    mode: 'allow',
    denys: [],
    allows: JSON.parse(process.env.app).ip_whitelist || [],
    log: function(clientIp, access) {
      if (access === false) {
        const {loggingWhenWhitelist} = require('./src/services/basicFunction');
        loggingWhenWhitelist(this.req, this.res, options);
      }
    },
    forceConnectionAddress: false,
    statusCode: 403,
    redirectTo: '',
    message: 'Forbidden',
  };

  const enableWhiteList = JSON.parse(process.env.app).ip_whitelist_enable ||
                        false;

  if (enableWhiteList) {
    this.app.use(function(req, res, next) {
      this.req = req;
      this.res = res;
      next();
    }, whitelistIp(options));
  }

  return startServer;
};

const cb_afterRoute = async function() {
  this.app.use((req, res, next) => {
    res.append('Cache-Control', 'no-store');
    res.append('Content-Security-Policy', 'frame-ancestors \'none\'');
    res.append('X-Content-Type-Options', 'nosniff');
    res.append('X-Frame-Options', 'DENY');
    next();
  });

  // const {initGetToken} = require('./src/services/tokenFunction');
  // initGetToken.call(this, 'myIDS', 'get-token');
  // initGetToken.call(this, 'enroll', 'getToken');
  const serviceGetToken = this.utils().services('tokenFunction').
      modules('serviceGetToken');
  await serviceGetToken();
  const CronJob = require('cron').CronJob;
  const runTime = this.utils().app().conf('run_time') || '0 30 0 * * *';
  const job = new CronJob(runTime, serviceGetToken);
  job.start();
  return true;
};


const commonRod = require('common-rod');
const app = commonRod({
  beforeRoute: cb_BeforeRunServer,
  afterRoute: cb_afterRoute,
}, commonRodOpt);


app.session = function(req, res) {
  return req.headers['x-tid'] || req.invoke;
};


module.exports.server = app;
