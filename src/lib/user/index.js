'use strict'

const { Types } = require('mongoose')
const Model = require('./model')
const Boom = require('@hapi/boom')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const Db = require('../db')

Db.connect()

/**
 * [User Class]
 * @description The instans from this Class return all methods from User
 * Manage all user methos, this require Mongo Model pre defined and one Mongo connection success
 * @param {String} id - User mongo id, this field response with mongoId
 * @retun User Object intance
*/

class User {
  constructor (id = null) {
    if (!id) throw Boom.badRequest('User id not found or invalid')
    this.id = id
  }

  /**
   * @description [Add new user]
   * @param {Object} data - Object data with new user data
   */

  static async add (data = null) {
    try {
      const validateData = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
      }).validate(data, {
        allowUnknown: true
      })

      if (validateData.error) {
        throw Boom.badRequest(validateData.error)
      }

      data.password = await bcrypt.hash(data.password, 10)

      const user = await Model.create(data)

      return Promise.resolve(user.toObject())
    } catch (error) {
      if (error.name === 'ValidationError') {
        return Promise.reject(Boom.badRequest(error))
      }

      if (error.message.indexOf('duplicate key') >= 0) {
        return Promise.reject(Boom.conflict(`The user with the email: ${data.email} already exists`))
      }

      return Promise.reject(Boom.boomify(error))
    }
  }

  async get () {
    try {
      const userData = await Model.findOne({
        $or: [
          { _id: new RegExp('^[0-9a-fA-F]{24}$').test(this.id) ? Types.ObjectId(this.id) : null },
          { email: this.id }
        ]
      }).select('-password -__v')

      if (!userData) throw Boom.notFound('User not found')

      return Promise.resolve(userData.toObject())
    } catch (error) {
      return Promise.reject(Boom.boomify(error))
    }
  }

  /**
   * @description Validate user password
   * @param {String} password
   * @return {Boolean} true, false
   */

  async validPassword (password) {
    try {
      const userData = await Model.findOne({
        $or: [
          { _id: new RegExp('^[0-9a-fA-F]{24}$').test(this.id) ? Types.ObjectId(this.id) : null },
          { email: this.id }
        ]
      })

      if (!userData) throw Boom.notFound('User not found')

      const valid = await bcrypt.compare(password, userData.password)

      return Promise.resolve(valid)
    } catch (error) {
      return Promise.reject(Boom.boomify(error))
    }
  }

  /**
   * [Get all users in db]
   * @param {Object} query - Query filter Object acepted for Mongoose find() method
   */

  static async getAll (query = {}) {
    try {
      // Validate query param type Object
      if (Joi.object().validate(query).error) throw Boom.badRequest('Parameter "query" to getAll() must be an object')

      const users = await Model.find(query).select('-password -__v').lean()
      return Promise.resolve(users)
    } catch (error) {
      return Promise.reject(Boom.boomify(error))
    }
  }

  async delete () {
    try {
      const userData = await this.get()
      await Model.deleteOne({ _id: userData._id })

      return Promise.resolve(userData)
    } catch (error) {
      return Promise.reject(Boom.boomify(error))
    }
  }

  /**
   * [Update an user]
   * @param {Object} data - Object with new data for user
   */

  async update (data = {}) {
    try {
      if (Joi.object().required().empty({}).validate(data).error) {
        throw Boom.badRequest('Parameter "data" to add() must be an object or is invalid')
      }

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10)
      }

      const userData = await this.get()
      await Model.updateOne({ _id: userData._id }, data)

      return Promise.resolve(await this.get())
    } catch (e) {
      const error = (e.name === 'CastError') ? Boom.badRequest(e) : Boom.boomify(e)
      return Promise.reject(error)
    }
  }
}

module.exports = User
