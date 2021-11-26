// require and start immediately
// let app = require('common-rod')();

// OR
const commonRodOpt = {
  mongo_create_connect: true,
  detaillog_add_output_response: true,
  summarylog_auto_end: true,
}; // optional

// eslint-disable-next-line camelcase
const cb_BeforeRunServer = function() {
  this.debug('log log log');
  const startServer = true;
  const {loadCaCert} = require('./src/services/loadCaCert');
  loadCaCert((process.env.service)?JSON.parse(process.env.service ):null, this);
  const {initGetToken} = require('./src/services/tokenFunction');
  initGetToken.call(this, 'enroll', 'get_token');
  initGetToken.call(this, 'pidp', 'get_token');
  return startServer;
};

const commonRod = require('common-rod');
const app = commonRod(cb_BeforeRunServer, commonRodOpt);

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

// eslint-disable-next-line max-len
const enableWhiteList = JSON.parse(process.env.app).ip_whitelist_enable || false;
if (enableWhiteList) {
  app.use(function(req, res, next) {
    this.req = req;
    this.res = res;
    next();
  }, whitelistIp(options));
}

app.use((req, res, next) => {
  res.append('Cache-Control', 'no-store');
  res.append('Content-Security-Policy', 'frame-ancestors \'none\'');
  res.append('X-Content-Type-Options', 'nosniff');
  res.append('X-Frame-Options', 'DENY');
  next();
});

app.session = function(req, res) {
  return req.headers['x-tid'] || req.invoke;
};
module.exports.server = app;
