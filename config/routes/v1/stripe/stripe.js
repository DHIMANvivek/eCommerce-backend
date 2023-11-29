const express = require('express');
const router = express.Router();
const webhookController = require('../../../../controller/stripe/stripe')
const adminVerify = require('./../../../../middlewares/adminVerify');
const jwtVerify = require('./../../../../middlewares/jwtVerify');

router.post('/webhook', express.raw({type: 'application/json'}) , webhookController.stripeWebhook);

module.exports = router;