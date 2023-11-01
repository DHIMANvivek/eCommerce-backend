const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const admin = require('firebase-admin');

require("dotenv").config();
const app = express();
app.use(bodyParser.json({limit: '50mb'}));

const serviceAccount = require('./tradevogue-firebase-adminsdk-mohjp-c7361ba1b1.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.post('/send-notification', (req, res) => {
  const { title, body, icon, token } = req.body;

  console.log('title is ', title, 'body is ', body, 'icon is ', icon, 'token is ', token)

  const message = {
      "notification": {
        "title": title,
        "body": body,
      },
      "token": req.body.token,
    };

  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      res.status(200).send('Notification sent successfully');
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      res.status(500).send('Error sending notification');
    });
});


// const publicVapidKey = 'BHpZMgcqmYkdUWVXuYP0ByYwIkvvcDaYgfPqKjW1hps4fbMNs1uR37kbq-PmJUanYDdeiEgl8lfhMDUu3fXk1KM';
// const privateVapidKey = '2tVV2JHt8jcBLCTSSJmTO4kx0-zx7W8QavXEZOGWprk';

// webpush.setVapidDetails('mailto:googlydhiman.4236@gmail.com', publicVapidKey, privateVapidKey);
// app.post('/subscribe', (req, res) => {
//   const subscription = req.body;

//   const payload = JSON.stringify({ title: req.body.title ,
//   body: req.body.body,
// icon: req.body.icon,
// to: req.body.to });

//   webpush.sendNotification(subscription, payload)
//       .then(() => {
//           console.log('Push notification sent');
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
const routes = require('./config/routes');
app.use(routes);

// app.listen(process.env.port, (err) => {
//     if (err)
//         console.log(err);
//     else
//         console.log(`listening to port ${process.env.port}`);
// })

let port = 1000;
app.listen(port, (err) => {
  if (err)
    console.log(err);
  else
    console.log(`listening to port ${port}`);
});


const server = app.listen(3000, () => {
  console.log(`Chat Server listening on port ${3000}`);
});

const io = require('socket.io')(server);

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('chatMessage', (data) => {
//       console.log(data);
//       io.emit('message', data);
//   });

//   socket.on('disconnect', () => {
//       console.log('A user disconnected');
//   });
// });

// const Message = require('./models/message');
const User = require('./models/users')

io.on('connection', (socket) => {
    socket.on('chatMessage', (data) => {
        const user = socket.user; 
        const newMessage = new Message({
            user: user, 
            content: data, 
        });

        console.log(newMessage)

        newMessage.save()
            .then(() => {
                
                io.emit('message', { user: user, content: newMessage.content });
            })
            .catch((error) => {
                console.error('Error saving message:', error);
            });
    });
});
