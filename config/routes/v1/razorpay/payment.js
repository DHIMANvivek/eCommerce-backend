const express = require('express');
const router = express.Router();
const paymentController = require('../../../../controller/razorpay/payment')
const adminVerify = require('./../../../../middlewares/adminVerify');
const jwtVerify = require('./../../../../middlewares/jwtVerify');

router.post('/createUpiPayment', jwtVerify , paymentController.createUpiPayment);
router.post('/verify', paymentController.verify);

module.exports = router;