const express = require('express');
const router = express.Router();
const userController = require('../../controller/user/user');

router.post("/create-payment-intent", userController.createPaymentIntent);
router.post('/user' , userController.GetParticularUser);
router.post('/orders', userController.GetParticularUserOrder);
router.post('/address', userController.AddAddress);
router.post('/EditAddress', userController.EditAddress);

module.exports = router;