const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
// require('./public/checkout')
require("dotenv").config(); 
const app = express();
const cors = require('cors');
app.use(cors());
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
app.use(express.static("public"));

require("./config/db/db");

// Set up CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200' , 'https://e-commerce-backend-7tt3.vercel.app', 'https://e-commerce-backend-7tt3-i7ilppj5a-dhimanvivek.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE,FETCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json());


const endpointSecret = 
"whsec_3ab6989c4dd3fa67a11fb76b2cbb4a4e15687f60550b2d2fbe4b85ab3d0e0c94";

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

    switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.send();
});



// parseFloat(items[0].price * 100)
app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 123,
    currency: "inr",
    description: JSON.stringify(items),
    metadata: {
      items: JSON.stringify(items),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // console.log(JSON.parse(paymentIntent.description)[0].id, "paymentIntent")
res.json({ clientSecret: paymentIntent.client_secret, description: paymentIntent });
  console.log(items , "from index.js");
});

const routes = require('./routes/route');
app.use(routes);





app.use(require('./DEMO'));

let port = 5000;
app.listen(5000, (err) => {
    if (err)
        console.log(err);
    else
        console.log(`listening to port ${port}`);
});
