const express = require('express');
const router = express.Router();
const cartController = require('./../../../controller/cart');

router.post('/fetch', cartController.fetchCart);

module.exports = router;