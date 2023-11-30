const express = require('express');
const router = express.Router();
const webhookController = require('../../../../controller/stripe/stripe');
const adminVerify = require('./../../../../middlewares/adminVerify');
const jwtVerify = require('./../../../../middlewares/jwtVerify');

console.log('hello i am insdie stripe');
router.post('/webhook', webhookController.stripeWebhook);

module.exports = router;
