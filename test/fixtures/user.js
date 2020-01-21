'use strict'

const uuid = require('uuid/v4')

module.exports = {
  data () {
    const user = {
      email: `${uuid()}@gmail.com`,
      name: uuid(),
      password: uuid()
    }

    return user
  }
}
