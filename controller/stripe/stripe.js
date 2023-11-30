const ordersModel = require('../../models/order');
const stripe = require('stripe')('sk_test_51NvsyeSENcdZfgNiy559a6dtaofzqfn00MVNCrPe4kQWAZNZulhdDmJePJTZvSSzzu4xnkTjHIjmWPVdzTW1L6oc00oI29MAG4');
const endpointSecret = 'whsec_3ab6989c4dd3fa67a11fb76b2cbb4a4e15687f60550b2d2fbe4b85ab3d0e0c94';

const express = require('express');

const app = express();


const stripeWebhook = async (request, response) => {
  let event;
  console.log('i am inside controller');
  const signature = request.headers['stripe-signature'];

  try {
    console.log('req body is ',request.body);
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(
        (request.body),
        signature,
        endpointSecret
      );
    } else {
      event = (request.body);
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
    response.status(200).send('ok'`Webhook received ${signature}`);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    response.sendStatus(400);
  }
}


app.use(express.raw({ type: 'application/json' }));

// app.use(express.json());
module.exports = {
  stripeWebhook
}