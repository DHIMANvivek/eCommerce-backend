const express = require('express');
const router = express.Router();
const cartController = require('./../../../controller/cart');
const jwtVerify = require('./../../../middlewares/jwtVerify');

router.post('/fetch', cartController.fetchCart);
router.post('/add', jwtVerify, cartController.addItems);
router.post('/remove', jwtVerify, cartController.removeItem);
router.post('/update', jwtVerify, cartController.updateItem);
router.get('/clear', jwtVerify, cartController.clearCart);
router.post('/removeItems', jwtVerify, cartController.removeItems);


module.exports = router;