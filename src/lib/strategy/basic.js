'use strict'

const { BasicStrategy } = require('passport-http')
const Boom = require('@hapi/boom')
const User = require('../user')
const Auth = require('../auth')

module.exports = new BasicStrategy(async (email, password, cb) => {
  try {
    const user = new User(email)
    const validPassword = await user.validPassword(password)

    if (!validPassword) return cb(Boom.unauthorized(), false)

    try {
      const userData = await user.get()

      userData.token = Auth.jwtSign({
        sub: userData._id,
        email: userData.email
      })

      return cb(null, userData)
    } catch (error) {
      return cb(Boom.unauthorized(), false)
    }
  } catch (error) {
    return cb(error)
  }
})
