'use strict'

const Boom = require('@hapi/boom')
const User = require('./user')
const Auth = require('./auth')

module.exports = {
  verifyUser: async (email, password) => {
    try {
      const user = new User(email)
      const validPassword = await user.validPassword(password)

      if (!validPassword) throw Boom.unauthorized()

      const userData = await user.get()
      userData.token = Auth.jwtSign({
        sub: userData._id,
        email: userData.email
      })

      return Promise.resolve(userData)
    } catch (error) {
      return Promise.reject(Boom.unauthorized())
    }
  }
}
