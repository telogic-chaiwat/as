const Joi = require('joi');
const {contentType, authorization} = require('../headers');

const headersSchema = Joi.object({
  'content-type': contentType.applicationJSON,
  'authorization': authorization,
});

const bodySchema = Joi.object({
  request_id: Joi.string().required(),
  node_id: Joi.string().required(),
  type: Joi.string().valid('response_result').required(),
  reference_id: Joi.string().required(),
  success: Joi.boolean().required(),
  error: Joi.object().keys({
    code: Joi.number().optional(),
    message: Joi.string().allow('').optional(),
  }).optional(),

});

module.exports = {
  headersSchema,
  bodySchema,
};
