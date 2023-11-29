const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

let endpointSecret;

endpointSecret= "whsec_3ab6989c4dd3fa67a11fb76b2cbb4a4e15687f60550b2d2fbe4b85ab3d0e0c94";

const stripeWebhook = async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let data;
  let eventType;
  // Verify webhook signature and extract the event.
  if(endpointSecret){
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log("webhook verified");
    } catch (err) {
      console.log("webhook not verified", `${err.message}`, request.body)
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    data = event.data.object;
    eventType = event.type;
  }else {
    data = request.body.data.object;
    eventType = request.body.type;
  }
  

  // Handle the event
  if(eventType === 'payment_intent.succeeded'){
    console.log("payment intent succeeded");
    stripe.retrievePaymentIntent(data.id, function(err, paymentIntent) {
      if(err){
        console.log("error in retrieving payment intent", err);
      }else{
        console.log("payment intent retrieved", paymentIntent);
      }
    })
  }
  // switch (event.type) {
  //   case 'payment_intent.succeeded':
  //     const paymentIntentSucceeded = event.data.object;
  //     console.log('PaymentIntent was successful!');
  //     // Then define and call a function to handle the event payment_intent.succeeded
  //     break;
  //   // ... handle other event types
  //   default:
  //     console.log(`Unhandled event type ${event.type}`);
  // }

  // Return a 200 response to acknowledge receipt of the event
  response.send().end();
};

module.exports = {
  stripeWebhook
};
