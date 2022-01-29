const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt");
const { Auth } = require("../models/auth.model");
const { User } = require("../models/user.model");

const { generateToken } = require("../utils.js");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Auth.findOne({username: username});
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Check your user credentials" })
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(403).json({ success: false, message: "Wrong Password. Enter correct password" })
    }
    
    const token = generateToken(user._id);
    console.log({token});
    return res.status(200).json({ user, token, success: true, message: "Login Successful" }) 

  } catch (error) {
    return res.status(500).json({ success: false, message: "Something went wrong", errorMessage: error.message })
  }
})


router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const userName = await Auth.findOne({username: username});
  if (userName === null) {
    try {
      const NewUser = new Auth({ username, password, email });

      const salt = await bcrypt.genSalt(10);
      NewUser.password = await bcrypt.hash(NewUser.password, salt);

      const savedUser = await NewUser.save();

      const token = generateToken(savedUser._id);
      const NewUserDetails = new User({
        _id: NewUser._id,
        liked: [], history: [], watchLater: [], playList: []
      });

      await NewUserDetails.save();
      return res.status(201).json({ user: savedUser, token, success: true, message: "Sign Up Successful" })
      
    } catch (error) {
      return res.status(401).json({ success: false, message: "Error while adding user" })
    }
  } return res.status(409).json({ success: false, message: "User Already Exists" })
})

module.exports = router;