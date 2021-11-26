/* eslint-disable max-len */
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
// const settings = JSON.parse(process.env.server);


router.post('/idp/response', (req, res, next)=>{
  res.status(202).send();
});

router.post('/idp/error_response', (req, res, next)=>{
  res.status(202).send();
});


router.post('/sign', (req, res, next)=>{
  res.status(200).send({
    signature: 'base64',
  });
});

// router.get('/utility/nodes/27DB668C-155C-4D90-843D-ADAE12D779CE1', (req, res, next)=>{
router.get('/utility/nodes/:node_id', (req, res, next)=>{
  res.status(200).send({
    public_key: '1234',
    master_public_key: '12345',
    node_name: 'ndid',
    role: 'testing',
    node_id_whitelist_active: 'test',
    mp: {
      ip: '0.0.0.0',
      port: '1000',
    },
    active: true,
  });
});

router.post('/as/data/:request_id/:service_id', (req, res, next)=>{
  res.status(202).send({
    node_id: 'string',
    reference_id: 'string',
    callback_url: 'string',
    data: 'string',
  });
});

router.post('/as/error/:request_id/:service_id', (req, res, next)=>{
  res.status(202).send({
    node_id: 'string',
    reference_id: 'string',
    callback_url: 'string',
    data: 'string',
  });
});
module.exports = router;
