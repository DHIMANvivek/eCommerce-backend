const express = require("express");
const bodyParser = require("body-parser");
const admin = require('firebase-admin');
require('dotenv').config();
const app = express();
const ordersModel = require('./models/order');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51NvsyeSENcdZfgNiy559a6dtaofzqfn00MVNCrPe4kQWAZNZulhdDmJePJTZvSSzzu4xnkTjHIjmWPVdzTW1L6oc00oI29MAG4');
const endpointSecret = 'whsec_3ab6989c4dd3fa67a11fb76b2cbb4a4e15687f60550b2d2fbe4b85ab3d0e0c94';
app.post('/webhook', express.raw({ type: 'application/json' }), async(request, response) => {
  let event;
  const signature = request.headers['stripe-signature'];
  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } else {
      event = JSON.parse(request.body);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        console.log(`PaymentIntent for ${paymentIntent.description} was successful!`);
        const requestBody = request.body.toString('utf-8');
        const jsonData = JSON.parse(requestBody);
        const description = `${paymentIntent.description}`;
        const payment = `${paymentIntent.id}`;

        try{
          if(jsonData.data.object.status === "succeeded"){
            const descriptionObject = JSON.parse(description);
            const orderId = descriptionObject.orderId;
            console.log("data to db from here",  payment);
            console.log("data to db from here",  `${orderId}`);

            const result = await ordersModel.updateOne(
              { orderID: `${orderId}` },
              {
                $set: {
                  payment_status: 'success',
                  transactionId: payment,
                  MOP: 'card',
                },
              }
            );
          }
        }catch(err){
        console.log(err, "error is");
        }
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }
    response.send();
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    response.sendStatus(400);
  }
});

app.use(bodyParser.json({ limit: '50mb' }));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '35mb',
    parameterLimit: 50000,
  }),
);

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


let port = 1000;
app.listen(port, (err) => {
    console.log(`listening to port ${port}`);
});