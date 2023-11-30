const express = require('express');
const router = express.Router();
const webhookController = require('../../../../controller/stripe/stripe');
const adminVerify = require('./../../../../middlewares/adminVerify');
const jwtVerify = require('./../../../../middlewares/jwtVerify');

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser');

// Configure body-parser to parse raw body as buffer
router.use(bodyParser.raw({ type: '*/*' }));

router.post('/webhook', webhookController.stripeWebhook);

module.exports = router;
