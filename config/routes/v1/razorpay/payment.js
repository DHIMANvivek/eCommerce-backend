const express = require('express');
const router = express.Router();
const paymentController = require('../../../../controller/razorpay/payment')
const adminVerify = require('./../../../../middlewares/adminVerify');

router.post('/createUpiPayment', paymentController.createUpiPayment);

module.exports = router;