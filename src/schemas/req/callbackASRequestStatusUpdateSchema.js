/* eslint-disable max-len */
const Joi = require('joi');
const {contentType, authorization} = require('../headers');

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
  'authorization': authorization,
});

const dataRequestListSchema = {
  service_id: Joi.string().required(),
  as_id_list: Joi.array().items(Joi.string()).required(),
  min_as: Joi.number().required(),
  request_params_hash: Joi.string().required(),
  response_list: Joi.array().items(Joi.object({
    as_id: Joi.string().optional(),
    signed: Joi.boolean().optional(),
    received_data: Joi.boolean().optional(),
    error_code: Joi.number().optional(),
  })).optional(),
};

const bodySchema = Joi.object({
  node_id: Joi.string().required(),
  type: Joi.string().valid('request_status').required(),
  request_id: Joi.string().required(),
  requester_node_id: Joi.string().required(),
  mode: Joi.number().valid(1, 2, 3).required(),
  request_message_hash: Joi.string().required(),
  min_ial: Joi.number().required(),
  min_aal: Joi.number().required(),
  min_idp: Joi.number().required(),
  idp_id_list: Joi.array().items(Joi.string()).required(),
  response_list: Joi.array().items(Joi.object({
    ial: Joi.number().optional(),
    aal: Joi.number().optional(),
    status: Joi.string().valid('accept', 'reject').optional(),
    error_code: Joi.number().optional(),
    signature: Joi.string().optional(),
    idp_id: Joi.string().required(),
    valid_signature: Joi.boolean().optional().allow(null),
    valid_ial: Joi.boolean().optional().allow(null),
  })).required(),
  data_request_list: Joi.array().items(dataRequestListSchema).required(),
  request_timeout: Joi.number().required(),
  closed: Joi.boolean().required(),
  timed_out: Joi.boolean().required(),
  status: Joi.string().valid('pending', 'confirmed', 'rejected', 'completed', 'complicated').required(),
  block_height: Joi.string().required(),
});

module.exports = {
  headersSchema,
  bodySchema,
};
