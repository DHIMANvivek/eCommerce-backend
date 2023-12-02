const { sendInvoiceTemplate , TicketStatusTemplate } = require('../../helpers/INDEX');
const mailer = require('../../helpers/nodemailer');
const ordersModel = require('../../models/order');
const stripe = require('stripe')('sk_test_51NvsyeSENcdZfgNiy559a6dtaofzqfn00MVNCrPe4kQWAZNZulhdDmJePJTZvSSzzu4xnkTjHIjmWPVdzTW1L6oc00oI29MAG4');
const endpointSecret = 'whsec_3ab6989c4dd3fa67a11fb76b2cbb4a4e15687f60550b2d2fbe4b85ab3d0e0c94';

const express = require('express');

const app = express();

const createPaymentIntent = async (req , res ) => {
  console.log("intent coming is ", req.body)
  const response = await fetch('http://localhost:1000/paymentKeys/get');
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const privateKey = data[0].keys[0].privateKey;

    const stripe = require('stripe')(privateKey);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000,
            currency: "inr",
            description: JSON.stringify(req.body),
            metadata: {
                items: JSON.stringify(req.body),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret, description: paymentIntent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
    }
}

const invoiceSend = async (req, res) => {
  console.log("invoice data", req.body);
  // return;
  const mailData = {
      email: req.body.receipt_email,
      subject: "Invoice",
      invoice: req.body
  }
  const emailTemplate = sendInvoiceTemplate(mailData.invoice);
  await mailer(mailData, emailTemplate);

  res.status(200).json({
      message: "done"
  })
}

const ticketStatus = async (req, res) => {  
  try {
    const mailData = {
        email: req.body.email,
        subject: "Ticket Status",
        status: req.body.status,
        message: req.body.message
    }
    const emailTemplate = TicketStatusTemplate(mailData);
    const mailSent = await mailer(mailData, emailTemplate);

    res.status(200).json({
        message: "done"
    })
} catch (error) {

  }
}

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
  stripeWebhook,
  createPaymentIntent,
  invoiceSend,
  ticketStatus
}