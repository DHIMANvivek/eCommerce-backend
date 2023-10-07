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
app.use(require('./config/routes'))


app.use(require('./DEMO/index'));

app.listen(process.env.port, (err) => {
    if (err)
        console.log(err);
    else
        console.log(`listening to port ${process.env.port}`);
})
const routes = require('./routes/route');
app.use(routes);

app.use(require('./DEMO'));

// let port = 5000;
// app.listen(5000, (err) => {
//   if (err)
//     console.log(err);
//   else
//     console.log(`listening to port ${port}`);
// });





// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// app.use(express.static("public"));


// // Set up CORS headers
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200' , 'https://e-commerce-backend-7tt3.vercel.app', 'https://e-commerce-backend-7tt3-i7ilppj5a-dhimanvivek.vercel.app');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE,FETCH');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });


// parseFloat(items[0].price * 100)

// app.post("/create-payment-intent", async (req, res) => {
//   const { items } = req.body;

//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: 123,
//     currency: "inr",
//     description: JSON.stringify(items),
//     metadata: {
//       items: JSON.stringify(items),
//     },
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   // console.log(JSON.parse(paymentIntent.description)[0].id, "paymentIntent")
// res.json({ clientSecret: paymentIntent.client_secret, description: paymentIntent });
//   // console.log(items , "from index.js");
// });

