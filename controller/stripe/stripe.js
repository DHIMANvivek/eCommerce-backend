const stripe = require('stripe')('sk_test_51NvsyeSENcdZfgNiy559a6dtaofzqfn00MVNCrPe4kQWAZNZulhdDmJePJTZvSSzzu4xnkTjHIjmWPVdzTW1L6oc00oI29MAG4');
const express = require('express');
const app = express();
const endpointSecret = 'whsec_3ab6989c4dd3fa67a11fb76b2cbb4a4e15687f60550b2d2fbe4b85ab3d0e0c94';


// This endpoint receives Stripe webhook events
const stripeWebhook = (request, response) => {
  console.log('Webhook received');
  
  const sig = request.headers['stripe-signature'];
  const payload = request.body;

  if (!Buffer.isBuffer(payload) && typeof payload !== 'string') {
    console.log('Invalid payload format');
    response.status(400).send('Invalid payload format');
    return;
  }

  let eventType;
  let eventData;

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    const dataObject = event.data.object;

    console.log('Webhook verified', dataObject);

    eventType = event.type;
    eventData = event.data.object;
  } catch (err) {
    console.log('Webhook not verified', `${err.message}`, typeof payload);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event based on its type
  if (eventType === 'charge.succeeded') {
    console.log('Payment intent succeeded');

    // Retrieve the payment intent using its ID
    stripe.paymentIntents.retrieve(eventData.id, (err, paymentIntent) => {
      if (err) {
        console.log('Error in retrieving payment intent', err);
      } else {
        console.log('Payment intent retrieved', paymentIntent);
        // Perform further actions or processing with paymentIntent here
      }
    });
  }

  response.sendStatus(200);
}
module.exports = {
  stripeWebhook
};
