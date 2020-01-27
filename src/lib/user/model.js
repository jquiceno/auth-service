'use strict'

const { Schema, model } = require('mongoose')

const schema = new Schema({
  name: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
},
{
  timestamps: {
    createdAt: 'created',
    updatedAt: 'updated'
  }
})

try {
  module.exports = model('users', schema)
} catch (error) {
  module.exports = model('users')
}
