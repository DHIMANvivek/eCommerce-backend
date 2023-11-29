const express = require('express');
const router = express.Router();
const wishlistController = require('./../../../controller/wishlist');

router.get('/showWishlist',  wishlistController.showWishlists)
// router.post('/addWishlist', wishlistController.addWishlist)
router.post('/addToWishlist', wishlistController.addToWishlist)
router.post('/deleteWishlist', wishlistController.deleteWishlist)
router.get('/showWishlistCount', wishlistController.showWishlistCount)
router.post('/showWishlistProducts', wishlistController.showWishlistedData)
router.post('/deleteFromWishlist', wishlistController.removeFromWishlist)
// router.get('/insert', wishlistController.createDefault)


module.exports = router;