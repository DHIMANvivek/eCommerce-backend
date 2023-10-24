const express = require('express')
const router = express.Router();
const JwtVerify = require('../../../middlewares/jwtVerify');
const reviewsController = require('../../../controller/reviews');

router.post('/addOrUpdate', JwtVerify, reviewsController.addOrUpdateReview);
router.delete('/delete', JwtVerify, reviewsController.deleteReview);

module.exports = router;