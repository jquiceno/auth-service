'use strict'

const { BasicStrategy } = require('passport-http')
const { verifyUser } = require('../utils')

module.exports = new BasicStrategy(async (email, password, done) => {
  try {
    const userData = await verifyUser(email, password)
    return done(null, userData)
  } catch (error) {
    return done(error)
  }
})
