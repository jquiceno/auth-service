'use strict'

const test = require('ava')
const Server = require('../src/server')
const request = require('supertest')
const uuid = require('uuid/v4')
const { validateObject } = require('./utils')
const Joi = require('@hapi/joi')
const { User, Auth } = require('../src')
const fixtures = require('./fixtures')

const baseUrl = '/auth'

test.before(async t => {
  const newUserData = fixtures.user.data()
  const userData = await User.add(newUserData)

  userData.password = newUserData.password
  userData.authorization = `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString('base64')}`

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

// test('Error login, invalid password', async t => {
//   const { userData } = t.context

//   const password = uuid()
//   const email = userData.email

//   const authorization = `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`

//   const { body: { data } } = await request(Server)
//     .post(`${baseUrl}/sigin`)
//     .set('Authorization', authorization)
//     .expect(401)

//   const validation = validateObject(data, {
//     error: Joi.string(),
//     message: Joi.string()
//   })

//   t.falsy(validation.error, (validation.error) ? validation.error.message : '')
// })

test('Invalid user token', async t => {
  const token = uuid()

  const { body: bodyToken } = await request(Server)
    .get(`${baseUrl}/tokens/${token}`)
    .expect(200)

  const validation = validateObject(bodyToken.data, {
    isValid: Joi.boolean()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
  t.false(bodyToken.data.isValid)
})

test('Validate user token jwt', async t => {
  const { userData } = t.context

  const { body: { data } } = await request(Server)
    .post(`${baseUrl}/sigin`)
    .set('Authorization', userData.authorization)
    .expect(200)

  let validation = validateObject(data, {
    token: Joi.string()
  })

  const { token } = data

  const payload = Auth.jwtVerify(token)

  const { body: bodyToken } = await request(Server)
    .get(`${baseUrl}/tokens/${token}`)
    .expect(200)

  validation = validateObject(bodyToken.data, {
    token: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
  t.deepEqual(payload.email, userData.email)
  t.deepEqual(payload.sub, userData._id)
  t.true(payload.isValid)
})

test('User login', async t => {
  const { userData } = t.context

  const { body: { data } } = await request(Server)
    .post(`${baseUrl}/sigin`)
    .set('Authorization', userData.authorization)
    .expect(200)

  const validation = validateObject(data, {
    token: Joi.string()
  })

  const payload = Auth.jwtVerify(data.token)

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
  t.deepEqual(payload.email, userData.email)
})

test('Error login, invalid email', async t => {
  const password = uuid()
  const email = `${uuid()}@gmail.com`

  const authorization = `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`

  const { body: { data } } = await request(Server)
    .post(`${baseUrl}/sigin`)
    .set('Authorization', authorization)
    .expect(401)

  const validation = validateObject(data, {
    error: Joi.string(),
    message: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})

test('Error invalid login data', async t => {
  const { body: { data } } = await request(Server)
    .post(`${baseUrl}/sigin`)
    .expect(401)

  const validation = validateObject(data, {
    error: Joi.string(),
    message: Joi.string()
  })

  t.falsy(validation.error, (validation.error) ? validation.error.message : '')
})
