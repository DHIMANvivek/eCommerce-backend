const { sendInvoiceTemplate , TicketStatusTemplate } = require('../../helpers/INDEX');
const mailer = require('../../helpers/nodemailer');
const ordersModel = require('../../models/order');
const stripe = require('stripe')('sk_test_51NvsyeSENcdZfgNiy559a6dtaofzqfn00MVNCrPe4kQWAZNZulhdDmJePJTZvSSzzu4xnkTjHIjmWPVdzTW1L6oc00oI29MAG4');
const endpointSecret = 'whsec_3ab6989c4dd3fa67a11fb76b2cbb4a4e15687f60550b2d2fbe4b85ab3d0e0c94';

const express = require('express');
const app = express();

const chatSocket = async (req, res) => {
  // Ensure you have the 'io' instance available
  const io = req.app.get('io');

  // Emit the message to all connected sockets
  io.emit('message', 'Hello world');

  res.status(200).json({ message: 'Message sent to all sockets' });
};

app.use(express.raw({ type: 'application/json' }));

module.exports = {
  chatSocket
};