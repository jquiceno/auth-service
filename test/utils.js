'use strict'

const Joi = require('@hapi/joi')

module.exports = {
  validateObject (ob, schema, opts) {
    schema = Joi.object().keys(schema)
    const valid = schema.validate(ob, {
      allowUnknown: true
    })

    return valid
  }
}
