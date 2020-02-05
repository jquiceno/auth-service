'use strict'

const { Router } = require('express')
const router = Router()
const { basic, local } = require('../../lib/strategy')
const { Auth } = require('../../lib')
const passport = require('passport')
const defaults = require('defaults')
const User = require('../../lib/user')

passport.use('basic', basic)
passport.use('local', local)

const rt = [{
  path: '/signup',
  method: 'post',
  md: [],
  async handler (req, res, next) {
    try {
      const data = req.body
      const user = await User.add(data)

      const response = {
        data: user,
        statusCode: 201
      }

      return res.status(response.statusCode).json(response)
    } catch (error) {
      return next(error)
    }
  }
},
{
  path: '/signin',
  method: 'post',
  strategy: [passport.authenticate(['basic', 'local'], { session: false })],
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
  options = defaults(options, {
    routes: []
  })

  const { routes } = options

  routes.map(r => {
    const { path, md, strategy } = r

    const index = rt.findIndex(el => el.path === path)

    if (index === -1) return

    if (strategy) {
      passport.use(strategy.name, strategy.strategy)
      rt[index].strategy = passport.authenticate(strategy.name, { session: false })
    }

    rt[index] = Object.assign(r, {
      ...rt[index],
      md: !Array.isArray(md) ? rt[index].md : md
    })
  })

  rt.map(r => {
    if (r.strategy) r.md.push(r.strategy)

    router[r.method](r.path, r.md, r.handler)
  })
  return router
}
