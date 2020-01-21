'use strict'

const { Router } = require('express')
const router = Router()
const { basic } = require('../../lib/strategy')
const { Auth } = require('../../lib')
const passport = require('passport')

passport.use('basic', basic)

const rt = [{
  path: '/sigin',
  method: 'post',
  strategy: passport.authenticate('basic', { session: false }),
  md: [],
  async handler (req, res, next) {
    let response = {}

    try {
      response = {
        data: req.user,
        statusCode: 200
      }

      return res.json(response).status(response.statusCode)
    } catch (error) {
      return next(error)
    }
  }
},
{
  path: '/tokens/:token',
  method: 'get',
  md: [],
  async handler (req, res, next) {
    const { token } = req.params
    let response = {}

    try {
      const decode = Auth.jwtVerify(token)
      response = {
        data: decode,
        statusCode: 200
      }

      return res.json(response).status(response.statusCode)
    } catch (error) {
      return next(error)
    }
  }
}]

module.exports = (options = {}) => {
  const { routes = {} } = options

  rt.map(r => {
    const route = routes[r.path] ? routes[r.path] : null
    if (route) {
      if (route.md) r.md = [...route.md]

      if (route.strategy) {
        passport.use(route.strategy.name, route.strategy)
        r.strategy = passport.authenticate(route.strategy.name, { session: false })
      }
    }

    if (r.strategy) r.md.push(r.strategy)

    router[r.method](r.path, r.md, r.handler)
  })
  return router
}
