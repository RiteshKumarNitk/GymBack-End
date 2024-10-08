const express = require("express");
const port = 3005;

const app = express();
const bodyParser = require("body-parser");
//
require("./db");
require("./models/User");
//
const authRoutes = require('./routes/authRoutes');
const requireToken = require('./Middlewares/AuthTokenRequired');
//
app.use(bodyParser.json());
app.use(authRoutes);
//

app.get("/",requireToken, (req, res) => {
  console.log(req.user);
  res.send(req.user);
});

// app.post('/signup',(req, res)=>{
//     console.log(req.body);
//     res.send('this is sign up page')
// })
app.listen(port, () => {
  console.log(`server us running on port ${port}`);
});
