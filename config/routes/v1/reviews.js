const express = require('express')
const router = express.Router();
const JwtVerify = require('../../../middlewares/jwtVerify');
const reviewsController = require('../../../controller/reviews');

router.post('/add', JwtVerify, reviewsController.addReview);
router.post('/delete', JwtVerify, reviewsController.deleteReview);

module.exports = router;