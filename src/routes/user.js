const express = require("express");
require("../db/mongoose");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");


const User = require("../models/user");

const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    // checking a user
    const user = await User.findByCredentials(
        req.body.email,
        req.body.password
    );
    const token = await user.generateAuthToken();
    // when we are passing object to response, express json.stringify it for us
    res.send({user, token});
  } catch (err) {
    console.log(err);
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {

  // Targeting a specific token that was used when they authenticated right there
  try {
    // we are already auth, so have access tp user and token
    req.user.tokens = req.user.tokens.filter((token) => {
      // token im  looking at isnt the one that used for auth
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    // nullify
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});


router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((item) =>
      allowedUpdates.includes(item)
  );

  if (!isValidOperation) {
    return res.status(400).send({error: "invalid updates"});
  }

  try {
    updates.forEach(
        (updateItem) => (req.user[updateItem] = req.body[updateItem])
    );

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (err) {
    res.status(500).send();
  }
});

// provide configs
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  // making restriction on a file
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image")); // send error to the user
    }
    cb(undefined, true);
  },
});


// multer middleware is gonna pass data through to this function if we dont specify destination
router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
      // convert to png
      req.user.avatar = await sharp(req.file.buffer)
          .resize({width: 250, height: 250})
          .png()
          .toBuffer();

      await req.user.save();
      res.status(201).send();
    },
    // handle any error
    (error, req, res, next) => {
      res.status(400).send({error: error.message});
    }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.status(200).send();
});

// get user profile avatar
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png"); // setting header
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send();
  }
});

module.exports = router;
