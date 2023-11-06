const express = require('express');
const router = express.Router();
const bannersController = require('./../../../../controller/custom-website-elements/banner');
const adminVerify = require('./../../../../middlewares/adminVerify');

router.post('/setBanners', bannersController.setBanners)
router.get('/getBanners', bannersController.getBanners )

module.exports = router;