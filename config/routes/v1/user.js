const express = require('express')
const router = express.Router();

const JwtVerify = require('../../../middlewares/jwtVerify');
const userController = require('../../../controller/user')
const authController = require('./../../../controller/authentication');

// Authentication
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forget', authController.forgotPassword);
router.post('/update', JwtVerify, authController.updatePassword);

// User Account
router.get('/getDetails', userController.getDetails)
router.post('/updateDetails', userController.updateDetails)
router.get('/getAddress', userController.getAddress)
router.post('/addAddress', userController.addAddress)
router.get('/deleteAddress', userController.deleteAddress)
router.get('/updateAdress', userController.updateAddress)
router.post('/create-payment-intent', userController.createPaymentIntent);

module.exports = router;