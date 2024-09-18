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

// Generate a 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

// SignUp route
router.post("/SignUp", async (req, res) => {
  const { name, email, password, dob, address } = req.body;

  // Check for missing fields
  if (!email || !name || !password || !dob || !address) {
    return res.status(422).json({ error: "Please fill all the fields" });
  }

  try {
    // Check if user already exists
    const savedUser = await User.findOne({ email });
    if (savedUser) {
      return res.status(422).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create and save the new user
    const user = new User({
      name,
      email,
      password: hashedPassword, // Save the hashed password
      dob,
      address,
    });
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (err) {
    console.log("db error", err);
    return res.status(422).json({ error: err.message });
  }
});

// Verify route
router.post("/verify", async (req, res) => {
    console.log('sent by client - ', req.body)
    const { name, email, password, dob, address } = req.body;
  
    if (!email || !name || !password || !dob || !address) {
      return res.status(422).json({ error: "Please fill all the fields authroutes" });
    }
  
    try {
      const savedUser = await User.findOne({ email: email });
      if (savedUser) {
        return res.status(422).json({ error: "User already exists" });
      }
  
      // Generate the verification code
      const verificationCode = generateVerificationCode();
      console.log("Generated Verification Code:", verificationCode); // Log verification code to the console
  
      try {
        await mailer(email, verificationCode); // Send the verification code via email
        const user = [{ name, email, password, dob, address, verificationCode }];
        res.send({
          message:"Verification code sent to your email",
          udata: user,
        });
      } catch (err) {
        console.log("Error sending email:", err);
        res.status(500).json({ error: "Error sending email" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  });
  

// Signin route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Please enter email and password" });
  }

  try {
    const savedUser = await User.findOne({ email });
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, savedUser.password);
    if (passwordMatch) {
      const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
      return res.json({ message: "Signin successful", token });
    } else {
      return res.status(422).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
