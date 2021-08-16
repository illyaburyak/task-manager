const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const {userOneId, userOne, setUpDB} = require('./fixtures/db')


// runs before each test.
// Wanna make sure that each test runs in the same environment with the same test data in the db
beforeEach(setUpDB)


test('Should signup a new user', async () => {

  // Can store response
  const response = await request(app)
      .post('/users')
      .send({
        name: "amanda",
        email: "amanda@gmail.com",
        password: "amanda123"
      }).expect(201)


  // Can test different stuff from response, and check if we got from db is correct
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // assertion about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'amanda',
      email: "amanda@gmail.com",
    },
    token: user.tokens[0].token
  })

})

test('Should login existing user', async () => {
  const res = await request(app)
      .post('/users/login')
      .send({
        email: userOne.email,
        password: userOne.password,
      }).expect(200)

  // check for same token
  const user = await User.findById(userOneId)
  expect(res.body.token).toBe(user.tokens[0].token)
})

test('Should not login nonexistent user', async () => {
  await request(app)
      .post('/users/login')
      .send({
        email: 'wrongEmail@gmail.com',
        password: 'wrongPassword',
      }).expect(400)
})

test('Should get user profile', async () => {
  await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
      .get('/users/me')
      .send()
      .expect(401)
})

test('Should delete account for user', async () => {
  await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)

  // check that user is deleted
  const user = await User.findById(userOneId)
  expect(user).toBeNull()

})


test('Should not delete account for unauthenticated user', async () => {
  await request(app)
      .delete('/users/me')
      .send()
      .expect(401)
})

// we need to get access to an image that we can upload in the test cases
test('should upload avatar image', async () => {
  await request(app)
      .post('/users/me/avatar')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      // supertest provide this func for files
      .attach('avatar', 'tests/fixtures/profile-pic.jpg')
      .expect(201)

  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer)) // check buffer from avatar to any buffer
})


test('Should update valid user field', async () => {
  await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        name: "Jess"
      })
      .expect(200)
  // check name
  const user = await User.findById(userOneId)
  expect(user.name).toEqual('Jess')
})


test('Should not update invalid user field', async () => {
  await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        location: 'Rio'
      })
      .expect(400)
})

