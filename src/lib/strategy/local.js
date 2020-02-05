'use strict'

const LocalStrategy = require('passport-local')
const { verifyUser } = require('../utils')

module.exports = new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const userData = await verifyUser(email, password)
    return done(null, userData)
  } catch (error) {
    return done(error)
  }
})
