'use strict'

const test = require('ava')
const { Server } = require('../src')
const request = require('supertest')
const uuid = require('uuid/v4')
const { validateObject } = require('./utils')
const Joi = require('@hapi/joi')
const { User } = require('../src')
const fixtures = require('./fixtures')

const baseUrl = '/users'

test.before(async t => {
  const userData = await User.add(fixtures.user.data())

  t.context.userData = userData
  t.context.userCollect = [userData._id]
})

test.after(async t => {
  const { userCollect } = t.context

  if (userCollect.length) {
    await Promise.all(userCollect.map(id => {
      return request(Server)
        .delete(`/users/${id}`)
        .expect(200)
    }))
  }
})

test('Validate user password', async t => {
  const newUserData = fixtures.user.data()

  const { body: { data } } = await request(Server)
    .post(`${baseUrl}`)
    .send(newUserData)
    .expect(201)

  const user = new User(data._id)
  const validPassword = await user.validPassword(newUserData.password)

  const validation = validateObject(data, {
    email: Joi.string().email(),
    name: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
  t.true(validPassword)
})

test('Error added user, invalid email', async t => {
  const user = {
    email: uuid(),
    name: uuid()
  }

  const { body: { data } } = await request(Server)
    .post('/users')
    .send(user)
    .expect(400)

  const validation = validateObject(data, {
    error: Joi.string(),
    message: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Error conflict, user email already exists', async t => {
  const { userData } = t.context

  const { body } = await request(Server)
    .post('/users')
    .send({ ...userData, password: uuid() })
    .expect(409)

  const validation = validateObject(body, {
    error: Joi.string(),
    message: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Get all matches by user', async t => {
  const { userData } = t.context

  const { body } = await request(Server)
    .get(`${baseUrl}/${userData._id}/matches`)
    .expect(200)

  const validation = validateObject(body, {
    data: Joi.array()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
  t.true(body.data.length > 0)

  const { data } = body

  t.deepEqual(data.filter(m => m.players.filter(p => p._id === userData._id)).length, data.length)
})

test('Get all users', async t => {
  const { body } = await request(Server)
    .get('/users')
    .expect(200)

  const validation = validateObject(body, {
    data: Joi.array()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
  t.true(body.data.filter(user => user.password).length === 0)
})

test('add new user', async t => {
  const { userCollect } = t.context
  const user = fixtures.user.data()

  const { body: { data } } = await request(Server)
    .post('/users')
    .send(user)
    .expect(201)

  const validation = validateObject(data, {
    _id: Joi.string(),
    email: Joi.string().email().valid(user.email),
    name: Joi.string().valid(user.name),
    created: Joi.date()
  })

  userCollect.push(data._id)

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Get user by id, email', async t => {
  const { userData } = t.context

  const { body: { data } } = await request(Server)
    .get(`/users/${userData._id}`)
    .expect(200)

  await request(Server)
    .get(`/users/${userData.email}`)
    .expect(200)

  const validation = validateObject(data, {
    _id: Joi.string().valid(userData._id),
    email: Joi.string().email().valid(userData.email),
    name: Joi.string().valid(userData.name),
    created: Joi.date()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Update user', async t => {
  const { userData } = t.context

  const newName = uuid()

  const { body: { data } } = await request(Server)
    .put(`/users/${userData._id}`)
    .send({
      name: newName
    })
    .expect(200)

  const validation = validateObject(data, {
    _id: Joi.string().valid(data._id),
    email: Joi.string().email().valid(data.email),
    name: Joi.string().valid(data.name),
    created: Joi.date()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Error invalid data update user', async t => {
  const { userData } = t.context

  const { body } = await request(Server)
    .put(`/users/${userData._id}`)
    .send()
    .expect(400)

  const validation = validateObject(body, {
    error: Joi.string(),
    message: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Error invalid data add user', async t => {
  const { body } = await request(Server)
    .post('/users')
    .send()
    .expect(400)

  const validation = validateObject(body, {
    error: Joi.string(),
    message: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Error get user by id not found', async t => {
  const { body } = await request(Server)
    .get(`/users/${uuid()}`)
    .expect(404)

  const validation = validateObject(body, {
    error: Joi.string(),
    message: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Error delete user by id not found', async t => {
  const { body } = await request(Server)
    .delete(`/users/${uuid()}`)
    .expect(404)

  const validation = validateObject(body, {
    error: Joi.string(),
    message: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})
