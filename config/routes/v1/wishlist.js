const express = require('express');
const router = express.Router();
const wishlistController = require('./../../../controller/wishlist');

const jwtVerify = require('../../../middlewares/jwtVerify')

router.get('/showWishlist', jwtVerify, wishlistController.showWishlists)

module.exports = router;