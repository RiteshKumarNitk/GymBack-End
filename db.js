const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.mongo_url).then(
    ()=>{
        console.log('connected to database');
    }
)
.catch((err)=>{
    console.log(`could not connect to db`+ err)
})