const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require('../../src/models/task')

// creating id  in separate const because we gonna use it in different places
const userOneId = new mongoose.Types.ObjectId()
// this is test data for login / auth
const userOne = {
  _id: userOneId,
  name: "Mike",
  email: "mike@gmail.com",
  password: "mike123",
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
  }]
}


// second user
const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
  _id: userTwoId,
  name: "Max",
  email: "max@gmail.com",
  password: "max123",
  tokens: [{
    token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
  }]
}

// making 3 different tasks kinda for real world data to use
const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First task",
  completed: false,
  owner: userOne._id
}


const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second task",
  completed: true,
  owner: userOne._id
}
const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third task",
  completed: true,
  owner: userTwo._id
}


const setUpDB = async () => {
  await User.deleteMany()
  await Task.deleteMany()
  // need to save at least one user because gonna test auth, login functionality
  await new User(userOne).save()
  await new User(userTwo).save()
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
}


module.exports = {
  userOneId,
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setUpDB,
}