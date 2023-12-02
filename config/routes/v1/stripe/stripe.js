const express = require('express');
const router = express.Router();
const webhookController = require('../../../../controller/stripe/stripe');
const adminVerify = require('./../../../../middlewares/adminVerify');
const jwtVerify = require('./../../../../middlewares/jwtVerify');

// router.post('/webhook', webhookController.stripeWebhook);
router.post('/create-payment-intent', webhookController.createPaymentIntent);
router.post('/invoiceSend', webhookController.invoiceSend);
router.post('/ticketStatus', webhookController.ticketStatus);

module.exports = router;
