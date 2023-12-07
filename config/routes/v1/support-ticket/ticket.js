const express = require('express');
const router = express.Router();
const ticketController = require('../../../../controller/support-ticket/ticket')
const adminVerify = require('./../../../../middlewares/adminVerify');
const JwtVerify = require('../../../../middlewares/jwtVerify');

// user
router.get('/get', ticketController.getTicketStatus);
router.post('/tokenDetails' , JwtVerify , ticketController.webPushTokenDetails);
router.post('/send', ticketController.supportTickets);
router.get('/getall', ticketController.getAllTickets);

// admin
router.post('/updateTitle', adminVerify , ticketController.updateTicketTitle);
router.post('/addTitle', adminVerify, ticketController.addTicketTitle);
router.post('/deleteTitle', adminVerify , ticketController.deleteTicketTitle);
router.post('/updateTicket', adminVerify , ticketController.updateTicket);
router.post('/deleteTicket', adminVerify , ticketController.deleteTicket);

// combined
// router.get('/combinedticketSearch', adminVerify , ticketController.combinedticketSearch);


module.exports = router;