const express = require("express");
const bodyParser = require("body-parser");
const admin = require('firebase-admin');
require('dotenv').config();
const app = express();
const ordersModel = require('./models/order');
const cors = require('cors');
require('dotenv').config();
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const endPointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = require('stripe')(stripeSecret);
const Secret = endPointSecret;

app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  let event;
  const signature = request.headers['stripe-signature'];
  try {
    if (Secret) {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        Secret
      );
    } else {
      event = JSON.parse(request.body);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const requestBody = request.body.toString('utf-8');
        const jsonData = JSON.parse(requestBody);
        const description = `${paymentIntent.description}`;
        const payment = `${paymentIntent.id}`;

        const descriptionObject = JSON.parse(description);
        const orderId = descriptionObject.orderId;

        const fs = require('fs').promises; 

            try {
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
              
              // async function handleWebhookData(paymentIntent, orderId, payment) {
              //   const webhookData = {
              //     paymentIntentId: `${paymentIntent.id}`,
              //     orderId,
              //     paymentStatus: 'success',
              //     transactionId: payment,
              //     MOP: 'card',
              //   };
              
              //   let existingData = [];
              //   try {
              //     const fileData = await fs.readFile('stripeLogs.json', 'utf-8');
              //     existingData = JSON.parse(fileData);
              //   } catch (err) {
              //     console.error('Error reading or parsing the file:', err);
              //   }
              
              //   existingData.push(webhookData);
              
              //   try {
              //     await fs.writeFile('stripeLogs.json', JSON.stringify(existingData, null, 2));
              //   } catch (err) {
              //     console.error('Error writing to file:', err);
              //   }
              // }
              
              // await handleWebhookData(paymentIntent, orderId, payment);
            } catch (err) {
              console.error('Error updating order:', err);
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
  res.setHeader('Access-Control-Allow-Origin', 'https://tradevogue.web.app', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE,FETCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// const { exec } = require('child_process');

// const startWebhookListener = () => {
//   const command = 'stripe listen --forward-to localhost:1000/webhook';

//   const child = exec(command);

//   child.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });

//   child.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//   });

//   child.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
// };

// startWebhookListener();

app.use(express.json());
const routes = require('./config/routes');
app.use(routes);


let port = 2001;
app.listen(port, (err) => {
  console.log(`listening to port ${port}`);
});