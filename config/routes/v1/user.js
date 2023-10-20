const express = require('express')
const router = express.Router();

const JwtVerify = require('../../../middlewares/jwtVerify');
const userController = require('../../../controller/user')
const authController = require('../../../controller/authentication');

// Authentication
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forget', authController.forgotPassword);
router.post('/update', JwtVerify, authController.updatePassword);
router.post('/changePassword', JwtVerify, authController.changePassword)

// User Account
// router.use(JwtVerify)
router.get('/getDetails',JwtVerify,userController.getDetails)
router.post('/updateDetails', userController.updateDetails)
router.get('/getAddress',JwtVerify,userController.getAddress)
router.post('/addAddress', userController.addAddress)
router.post('/deleteAddress', userController.deleteAddress)
router.get('/updateAdress', userController.updateAddress)
// router.post('/create-payment-intent', userController.createPaymentIntent);

//temp
router.post('/r', userController.putReviews);

router.post('/create-payment-intent', userController.createPaymentIntent);
router.get('/getFaq', userController.getFaq);
router.post('/sendData', userController.sendData);

router.get('/coupons',userController.getCoupons);
module.exports = router;