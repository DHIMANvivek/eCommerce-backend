const express = require('express');
const router = express.Router();
const chatController = require('../../../../controller/chat/chat');
const adminVerify = require('./../../../../middlewares/adminVerify');
const jwtVerify = require('./../../../../middlewares/jwtVerify');

// router.post('/webhook', webhookController.stripeWebhook);
router.get('/chat',jwtVerify, chatController.chatSocket);
router.get('/allOnlineUsers',jwtVerify, chatController.allOnlineUsers);

module.exports = router;
