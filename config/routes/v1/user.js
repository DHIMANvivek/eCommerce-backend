const express = require('express')
const router = express.Router();

const JwtVerify = require('../../../middlewares/jwtVerify');
const userController = require('../../../controller/user');
const authController = require('../../../controller/authentication');

// Authentication
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forget', authController.forgotPassword);
router.post('/update', JwtVerify, authController.updatePassword);
router.post('/changePassword', JwtVerify, authController.changePassword)

// User Account
// router.use(JwtVerify)
router.use(JwtVerify);
router.get('/getDetails',userController.getDetails)
router.post('/updateDetails', userController.updateDetails)
router.get('/getAddress',userController.getAddress)
router.post('/addAddress', userController.addAddress)
router.post('/deleteAddress', userController.deleteAddress)
router.post('/updateAdress', userController.updateAddress)
router.post('/setDefault',userController.DefaultAddress)

router.get('/getFaq', userController.getFaq);
router.post('/sendData', userController.sendData);
// router.get('/getPaginatedData/:model', userController.getPaginatedData);
// router.get('/coupons',userController.getCoupons);
// router.get('/coupons',userController.GetCoupons);

router.get('/getPaginatedData/:model', userController.getPaginatedData);

// support ticket
router.get('/getTicketTitle', userController.getTicketTitle);
router.post('/sendTicket', userController.sendTicket);
// router.post('/webPushDetails', userController.webPushDetails);
// router.get('/getPaymentKeys', userController.getPaymentKeys);


// router.get('/coupons',userController.getCoupons);
router.post('/used',userController.usedCoupon)
module.exports = router;