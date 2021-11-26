const Joi = require('joi');
const {contentType, authorization} = require('../headers');

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
  'authorization': authorization,
});


const bodySchema = Joi.object({
  'node_id': Joi.string().optional(),
  'type': Joi.string().valid('error').required(),
  'action': Joi.string().optional(),
  'request_id': Joi.string().optional(),
  'error': Joi.object().keys({
    'code': Joi.number().optional(),
    'message': Joi.string().allow('').optional(),
  }).required(),
});


module.exports = {
  headersSchema,
  bodySchema,
};
