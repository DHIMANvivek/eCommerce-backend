const express = require('express');
const router = express.Router();
const paymentKeys = require('./../../../../controller/custom-website-elements/paymentKeys');
const AdminVerify = require('../../../../middlewares/adminVerify');
const jwtVerify = require('../../../../middlewares/jwtVerify');

// user
router.get('/get' , paymentKeys.getPaymentKeys);

// admin
router.post('/add', jwtVerify , paymentKeys.addPaymentKeys);
router.get('/getAll', AdminVerify , paymentKeys.getAllPaymentKeys);
router.post('/update', AdminVerify , paymentKeys.updatePaymentKeys);
router.post('/delete', AdminVerify , paymentKeys.deletePaymentKeys);

module.exports = router;