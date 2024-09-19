const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "riteshkumar.nitk21@gmail.com",
    pass: "wxwefqsneijnhedp",
  },
});

// Mailer function
async function mailer(receiversemail, code) {
  const info = await transporter.sendMail({
    from: "riteshkumar.nitk21@gmail.com", // sender address
    to: `${receiversemail}`, // list of receivers
    subject: "Signup Verification Code",
    text: `Your Verification Code is ${code}`, // plain text body
    html: `<b>Your Verification Code is ${code}</b>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
}

// Password hashing
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

router.post("/signup", async (req, res) => {
  // console.log('sent by client - ', req.body);
  const { name, email, password, dob, address } = req.body;

  const user = new User({
    name,
    email,
    password,
    dob,
    address,
  });

  try {
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ message: "User Registered Successfully", token });
  } catch (err) {
    console.log(err);
  }
});

// Verify route
router.post("/verify", (req, res) => {
  console.log("sent by client - ", req.body);
  const { name, email, password, dob, address } = req.body;
  if (!name || !email || !password || !dob || !address) {
    return res.status(422).json({ error: "Please add all the fields" });
  }

  User.findOne({ email: email }).then(async (savedUser) => {
    if (savedUser) {
      return res.status(422).json({ error: "Invalid Credentials" });
    }
    try {
      let VerificationCode = Math.floor(100000 + Math.random() * 900000);
      let user = [
        {
          name,
          email,
          password,
          dob,
          address,
          VerificationCode,
        },
      ];
      await mailer(email, VerificationCode);
      res.send({
        message: "Verification Code Sent to your Email",
        udata: user,
      });
    } catch (err) {
      console.log(err);
    }
  });
});

// Signin route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please add email or password" });
  }
  const savedUser = await User.findOne({ email: email });

  if (!savedUser) {
    return res.status(422).json({ error: "Invalid Credentials" });
  }

  try {
    bcrypt.compare(password, savedUser.password, (err, result) => {
      if (result) {
        console.log("Password matched");
        const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
        res.send({ token });
      } else {
        console.log("Password does not match");
        return res.status(422).json({ error: "Invalid Credentials" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
