const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const settings = JSON.parse(process.env.server);
const NDID = require('../simulator/NDIDEmulator');
const path = require('path');

app.use(bodyParser.json());
app.use(NDID);

const fs = require('fs');
const https = require('https');

if (settings.use_https) {
  const options = {
    key: fs.readFileSync(settings.key),
    cert: fs.readFileSync(settings.cert),
    // ca: fs.readFileSync('ca-crt.pem'),
    // requestCert: true,
    rejectUnauthorized: true,
  };
  https.createServer(options, app).listen(port=settings.app_port, () => {
    console.log('Simulator is UP');
    console.log('using port: ' + settings.app_port);
    console.log('Server flow ' + settings.case);
  });
} else {
  app.listen(port=settings.app_port, () => {
    console.log('Simulator is UP');
    console.log('using port: ' + settings.app_port);
    console.log('Server flow ' + settings.case);
  });
}


