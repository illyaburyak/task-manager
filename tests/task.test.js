const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')

const {
  userOneId,
  userOne,
  setUpDB,
  taskTwo,
  taskThree,
  taskOne,
  userTwo,
} = require('./fixtures/db')


// runs before each test. We wanna make sure that each test runs in the same environment with the same test data in the db
beforeEach(setUpDB)

test('Should create task for user', async () => {
  const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send({
        description: "buying beer"
      })
      .expect(201)

  // check if we created a task
  const task = await Task.findById(res.body._id)
  expect(task).not.toBeNull()
  expect(task.completed).toEqual(false)
})

test('Should fetch user tasks', async () => {
  const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)

  expect(res.body.length).toEqual(2)
})

test('Should should not delete others users tasks', async () => {
  const res = await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .send()
      .expect(404)

  const task = Task.findById(taskOne._id)
  expect(task).not.toBeNull()
})