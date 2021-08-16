const express = require("express");
require("../db/mongoose");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();


router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    // parts[0] will be createdAt
    // and parts[1] will determined of its descending order or ascending
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user
        .populate({
          path: "tasks",
          match,
          options: {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort,
          },
        })
        .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/tasks", auth, async (req, res) => {
  // when task is created it's associated with the user who's auth
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // fetching tasks created
    const task = await Task.findOne({_id, owner: req.user._id});

    // if im not the  owner then 404
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  // update only properties that we have in db
  const updates = Object.keys(req.body);
  const allowedUpdates = ["completed", "description"];
  const isAllowed = updates.every((item) => allowedUpdates.includes(item));

  if (!isAllowed) {
    return res.status(400).send({error: "Invalid updates"});
  }

  // wanna find task by id and owner value
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404);
    }

    updates.forEach((updateItem) => (task[updateItem] = req.body[updateItem]));

    task.save();
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return req.status(404).send();
    }
    res.status(200).send(task);
  } catch (err) {
    res.status(404).send();
  }
});

module.exports = router;
