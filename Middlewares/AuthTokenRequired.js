const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model("User");
require('dotenv').config();


module.exports = (req, res, next) => {
    const { authorization } = req.headers; // Corrected spelling

    if (!authorization) {
        return res.status(401).send({ error: "You must be logged in. Token not provided." });
    }

    // Remove 'Bearer ' from the token string
    const token = authorization.replace("Bearer ", "");
    
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async(err, payload) => {
        if (err) {
            return res.status(401).send({ error: "Invalid token haiiiii" });
        }

        const { _id } = payload;

        // Find the user in the database
        User.findById(_id).then(userdata => {
            req.user = userdata;
            next();
        });
    });
};
