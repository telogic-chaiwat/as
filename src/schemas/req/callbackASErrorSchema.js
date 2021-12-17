const Joi = require('joi');
const {contentType} = require('../headers');

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
  // 'authorization': authorization,
});


const bodySchema = Joi.object({
  'node_id': Joi.string().optional().allow(''),
  'type': Joi.string().valid('error').required(),
  'action': Joi.string().optional().allow(''),
  'request_id': Joi.string().optional().allow(''),
  'error': Joi.object().keys({
    'code': Joi.number().optional().allow(''),
    'message': Joi.string().allow('').optional().allow(''),
  }).required(),
});


module.exports = {
  headersSchema,
  bodySchema,
};
