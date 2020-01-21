'use strict'

const { Strategy, ExtractJwt } = require('passport-jwt')
const User = require('../user')

const { AUTH_JWT_SECRET } = process.env

module.exports = new Strategy(
  {
    secretOrKey: AUTH_JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  },
  async (tokenPayload, done) => {
    try {
      const user = new User(tokenPayload.email)
      const userData = await user.get()

      return done(null, userData)
    } catch (error) {
      return done(error)
    }
  })
