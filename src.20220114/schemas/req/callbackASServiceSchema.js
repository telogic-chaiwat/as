const Joi = require('joi');
const {contentType} = require('../headers');

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
  // 'authorization': authorization,
});

const bodySchema = Joi.object({
  node_id: Joi.string().required(),
  type: Joi.string().valid('data_request').required(),
  request_id: Joi.string().required(),
  mode: Joi.number().valid(1, 2, 3).required(),
  namespace: Joi.string().required(),
  identifier: Joi.string().required(),
  service_id: Joi.string().required(),
  request_params: Joi.string().optional().allow('').allow(null),
  requester_node_id: Joi.string().required(),
  response_signature_list: Joi.array().items(Joi.string().base64()).required(),
  max_ial: Joi.number().valid(1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3).required(),
  max_aal: Joi.number().valid(1, 2.1, 2.2, 3).required(),
  creation_time: Joi.number().required(),
  creation_block_height: Joi.string().required(),
  request_timeout: Joi.number().required(),
});

module.exports = {
  headersSchema,
  bodySchema,
};
