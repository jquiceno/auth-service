'use strict'

const uuid = require('uuid/v4')

module.exports = {
  data () {
    const group = {
      name: `${uuid()}@gmail.com`,
      users: []
    }

    return group
  }
}
