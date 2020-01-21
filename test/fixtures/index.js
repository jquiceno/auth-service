'use strict'

const fs = require('fs')

const fixtures = {}

fs.readdirSync(__dirname).map(f => {
  if (f === 'index.js') return
  fixtures[f.split('.')[0]] = require(`./${f}`)
})

module.exports = fixtures
