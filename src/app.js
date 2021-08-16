const express = require("express");
const userRouter = require("./routes/user");
const taskRouter = require("./routes/task");
const app = express();


// pars incoming json to an object.
app.use(express.json());
// register route
app.use(userRouter);
app.use(taskRouter);


module.exports = app