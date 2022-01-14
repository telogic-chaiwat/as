const Joi = require('joi');
const {contentType} = require('../headers');

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
  // 'authorization': authorization,
});


const bodySchema = Joi.object({
  'node_id': Joi.string().required().allow(''),
  'type': Joi.string().valid('response_result').required(),
  'reference_id': Joi.string().required().allow(''),
  'request_id': Joi.string().required().allow(''),
  'success': Joi.boolean().required(),
  'error': Joi.object().keys({
    'code': Joi.number().optional().allow(''),
    'message': Joi.string().allow('').optional().allow(''),
  }).optional(),
});


module.exports = {
  headersSchema,
  bodySchema,
};
