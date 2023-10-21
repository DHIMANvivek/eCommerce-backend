const express = require('express');
const router = express.Router();
const cartController = require('./../../../controller/cart');
const jwtVerify = require('./../../../middlewares/jwtVerify');

router.post('/fetch', cartController.fetchCart);
router.post('/add', jwtVerify, cartController.addItem);
router.post('/remove', jwtVerify, cartController.removeItem);

module.exports = router;