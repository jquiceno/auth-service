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
  },
  toObject: {
    transform: (doc, ret) => {
      delete ret.password
      delete ret.__v
      ret._id = ret._id.toString()
    }
  }
})

try {
  module.exports = model('users', schema)
} catch (error) {
  module.exports = model('users')
}
