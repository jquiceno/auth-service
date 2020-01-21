'use strict'

/**
 * server.js start express server
 * export express app pre configured
 * init enviroment vars using dotenv
*/

const express = require('express')
const Boom = require('@hapi/boom')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const routes = require('../routes')

require('dotenv').config()

const { LOGGER, NODE_ENV } = process.env

const app = express()

app.use(helmet())

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}))

if (LOGGER) {
  if (NODE_ENV === 'dev') {
    app.use(morgan('dev', {
      skip: function (req, res) { return res.statusCode < 400 }
    }))
  } else {
    app.use(morgan('common'))
  }
}

app.use(express.json())

app.use('/auth', routes())

app.use((err, req, res, next) => {
  if (!err) return next()

  !LOGGER || console.error(err, `Error in : ${req.method}:${req.url}`)
  const { output } = Boom.boomify(err)
  return res.status(output.statusCode).json(output.payload)
})

module.exports = app
