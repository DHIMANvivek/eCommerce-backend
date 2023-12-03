const express = require('express');
const router = express.Router();
const chatController = require('../../../../controller/chat/chat');
const adminVerify = require('./../../../../middlewares/adminVerify');
const jwtVerify = require('./../../../../middlewares/jwtVerify');

// router.post('/webhook', webhookController.stripeWebhook);
router.post('/chat',jwtVerify, chatController.chatSocket);

module.exports = router;
