'use strict'

const uuid = require('uuid/v4')
const Moment = require('moment')

module.exports = {
  data () {
    const match = {
      settigns: {},
      date: Moment(),
      place: uuid()
    }

    return match
  }
}
