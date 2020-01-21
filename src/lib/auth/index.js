'use strict'

const jwt = require('jsonwebtoken')
const defaults = require('defaults')

require('dotenv').config()

const { AUTH_JWT_SECRET, AUTH_JWT_EXPIRESIN } = process.env

class Auth {
  jwtSign (payload, options) {
    options = defaults(options, {
      expiresIn: AUTH_JWT_EXPIRESIN
    })

    const token = jwt.sign(payload, AUTH_JWT_SECRET, {
      expiresIn: options.expiresIn
    })

    return token
  }

  jwtVerify (token) {
    try {
      const decoded = jwt.verify(token, AUTH_JWT_SECRET)
      decoded.isValid = true

      return decoded
    } catch (error) {
      return this.jwtError(error)
    }
  }

  jwtError (e) {
    const error = e
    let message = e.message

    switch (e.message) {
      case 'jwt expired':
        message = 'Token Expired'
        break
    }

    error.isValid = false
    delete error.name
    error.message = message
    return error
  }
}

module.exports = new Auth()
