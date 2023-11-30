const express = require("express");
const bodyParser = require("body-parser");
const admin = require('firebase-admin');
require('dotenv').config();
const app = express();

// const router = express.Router();
// const stripeController = require('./controller/stripe/stripe');
// router.post('/webhook', stripeController.stripeWebhook);

const ordersModel = require('./models/order');
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:4200' }));
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

const serviceAccount = require('./tradevogue-firebase-adminsdk-mohjp-c7361ba1b1.json');

// private keys of notification in env 
serviceAccount.private_key = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
serviceAccount.client_email = process.env.GOOGLE_CLIENT_EMAIL;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post('/send-notification', (req, res) => {
  const { title, body, icon, url, token , registration_ids } = req.body;
  const tokens = registration_ids || [token].filter(Boolean);
  const message = {
    notification: {
      title,
      body,
      image: icon
    },
    data: {
      url: String(url) || null
    },
    tokens: tokens,
  };

  admin.messaging().sendMulticast(message)
    .then((response) => {
      res.status(200).send('Notification sent successfully');
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      res.status(500).send('Error sending notification');
    });
});

// app.post('/send-notification', (req, res) => {
//   const { title, body, icon, token } = req.body;


//   const message = {
//       "notification": {
//         "title": title,
//         "body": body,
//         "image": icon
//       },
//       "token": req.body.token,
//   };

//   admin.messaging().send(message)
//     .then((response) => {
//       res.status(200).send('Notification sent successfully');
//     })
//     .catch((error) => {
//       console.error('Error sending message:', error);
//       res.status(500).send('Error sending notification');
//     });
// });


// const publicVapidKey = 'BHpZMgcqmYkdUWVXuYP0ByYwIkvvcDaYgfPqKjW1hps4fbMNs1uR37kbq-PmJUanYDdeiEgl8lfhMDUu3fXk1KM';
// const privateVapidKey = '2tVV2JHt8jcBLCTSSJmTO4kx0-zx7W8QavXEZOGWprk';

// webpush.setVapidDetails('mailto:googlydhiman.4236@gmail.com', publicVapidKey, privateVapidKey);
// app.post('/subscribe', (req, res) => {
//   const subscription = req.body;

//   const payload = JSON.stringify({ title: req.body.title,
// body: req.body.body,
// image: req.body.icon,
// to: req.body.to });

//   webpush.sendNotification(subscription, payload)
//       .then(() => {
//           res.status(201).json({ message: 'Push notification sent successfully' });
//       })
//       .catch((err) => {
//           console.error(err);
//           res.status(500).json({ error: 'Failed to send push notification' });
//       });
// });

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '35mb',
    parameterLimit: 50000,
  }),
);

// const cors = require('cors');
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


// const server = app.listen(3000, () => {
//   console.log(`Chat Server listening on port ${3000}`);
// });

// const io = require('socket.io')(server);

// io.on('connection', (socket) => {

//   socket.on('chatMessage', (data) => {
//       io.emit('message', data);
//   });

//   socket.on('disconnect', () => {
//   });
// });

// const Message = require('./models/message');
// const User = require('./models/users')

// io.on('connection', (socket) => {
//     socket.on('chatMessage', (data) => {
//         const user = socket.user; 
//         const newMessage = new Message({
//             user: user, 
//             content: data, 
//         });

//         newMessage.save()
//             .then(() => {
                
//                 io.emit('message', { user: user, content: newMessage.content });
//             })
//             .catch((error) => {
//                 console.error('Error saving message:', error);
//             });
//     });
// });
