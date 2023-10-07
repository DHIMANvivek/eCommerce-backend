const express = require('express');
const router = express.Router();
const userController = require('../../controller/user/user');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get("/getUser", userController.getUser);
router.get("/getProduct", userController.getProduct);
router.post("/create-payment-intent", userController.createPaymentIntent);

module.exports = router;