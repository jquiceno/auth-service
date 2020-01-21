'use strict'

const mongoose = require('mongoose')
require('dotenv').config()

module.exports = {
  info: null,
  async connect () {
    try {
      this.info = {
        url: process.env.MONGO_DB_URI,
        status: 1
      }

      mongoose.connection.on('error', console.error)

      const db = await mongoose.connect(process.env.MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
      })

      return Promise.resolve(db)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
