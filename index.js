const express = require("express");
const bodyParser = require("body-parser");
const compress = require('compression');

require('dotenv').config();
const app = express();
const ordersModel = require('./models/order');
const cors = require('cors');
const Products = require('./models/products')
const { sendInvoiceTemplate, TicketStatusTemplate } = require('./helpers/INDEX');
const mailer = require('./helpers/nodemailer');
const { updateCoupon } = require('./controller/offers');
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

        try {
          const result = await ordersModel.findOneAndUpdate(
            { orderID: orderId },
            {
              $set: {
                'products.$[].payment_status': 'success',
                transactionId: payment,
                MOP: 'card',
              },
            },
            { projection: { buyerId: 1 ,products:1,coupon:1}, returnOriginal: false }
          );
          var buyerId = result.buyerId.toString();
          
          // const buyerId = req.tokenData.id;

          console.log(result.buyerId.toString(), "buyer id is ")

          // const res=await ordersModel.findOne({ orderID: orderId  },{_id:0,coupon:1,products:1});
          if(result?.couponId){
            await updateCoupon(result.couponId,buyerId); 
        }

        
   
        if (result?.products) {
            await Promise.all(result.products.map(async (el) => {
              console.log('goint to decrease  product');
                await Products.updateOne(
                    {
                        sku: el.sku,
                        'assets.color': el.color,
                        'assets.stockQuantity.size': el.size
                    },
                    {
                        $inc: { 'assets.$[outer].stockQuantity.$[inner].quantity': -el.quantity, 'assets.$[outer].stockQuantity.$[inner].unitSold': el.quantity },
                    },
                    {
                        arrayFilters: [
                            { "outer.color": el.color },
                            { "inner.size": el.size }
                        ]
                    }
                );

                let particularProduct = await Products.findOne({ sku: el.sku });
                const allStockZero = particularProduct.assets.every(color => {
                    return color.stockQuantity.every(size => size.quantity === 0);
                });

                if (allStockZero) {
                    await Products.updateOne({sku:el.sku},{ $set:{"status.active": false} });
                }

            }));


        }
          
          const mailData = {
            email: jsonData.data.object.receipt_email,
            subject: "Invoice",
            invoice: jsonData
          }

          const emailTemplate = sendInvoiceTemplate(mailData.invoice);
          await mailer(mailData, emailTemplate);

          // product decrease query



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


app.use(compress());
app.use(cors());

require("dotenv").config();

app.use(express.static("public"));
require("./config/db/db");

// Set up CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.frontend_URL);
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


let port = 1000;
app.listen(port, (err) => {
  console.log(`listening to port ${port}`);
});