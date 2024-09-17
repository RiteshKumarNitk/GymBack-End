const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const jwt = require('jsonwebtoken');
require('dotenv').config();
//

const bcrypt = require('bcrypt');
router.post('/SignUp', async (req, res) => {
    console.log(req.body);
    const { name, email, password, dob, address } = req.body;

    // Check for missing fields
    if (!email || !name || !password || !dob ||!address) {
        return res.status(422).json({ error: "please fill all the fields" });
    }

    try {
        // Check if user already exists
        const savedUser = await User.findOne({ email: email });
        if (savedUser) {
            return res.status(422).json({ error: "invalid credentials" });
        }

        // Create and save the new user
        const user = new User({
            name, email, password, dob, address
        });
        await user.save();
        // res.json({ message: "user saved successfully" });
        const token = jwt.sign({_id: user._id},process.env.JWT_SECRET);
        res.send({token});

    } catch (err) {
        // Handle any errors during database operations
        console.log("db error", err);
        return res.status(422).json({ error: err.message });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(422).json({ error: "Please enter email and password" });
    }

    try {
        // Find user by email
        const savedUser = await User.findOne({ email: email });
        if (!savedUser) {
            return res.status(422).json({ error: "Invalid credentials" });
        }

        bcrypt.compare(password, savedUser.password, (err, result) => {
            if (result) {
                // If password matches, generate JWT and send it
                const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
                return res.json({ message: "Signin successful", token });
            } else {
                return res.status(422).json({ error: "Invalid credentials" });
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
