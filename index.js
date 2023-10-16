const express = require("express");
const webpush = require("web-push");
// const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();
const app = express();

const cors = require('cors');
app.use(cors());

require("dotenv").config(); 

app.use(express.static("public"));
require("./config/db/db");

// Set up CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE,FETCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json());
const routes = require('./config/routes');
app.use(routes);

// app.listen(process.env.port, (err) => {
//     if (err)
//         console.log(err);
//     else
//         console.log(`listening to port ${process.env.port}`);
// })

let port = 1000;
app.listen(port, (err) => {
  if (err)
    console.log(err);
  else
    console.log(`listening to port ${port}`);
});


