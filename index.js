const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

require("./config/db/db");

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());

const routes = require('./routes/route');
app.use(routes);



let port = 5000;
app.listen(5000, (err) => {
    if (err)
        console.log(err);
    else
        console.log(`listening to port ${port}`);
});
