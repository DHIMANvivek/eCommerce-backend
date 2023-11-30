const express = require('express');
const router = express.Router();
const bannersController = require('./../../../../controller/custom-website-elements/banner');
const adminVerify = require('./../../../../middlewares/adminVerify');

router.post('/setBanners', adminVerify, bannersController.setBanners)
router.get('/getBanners', bannersController.getBanners )
router.post('/deleteBanner',adminVerify, bannersController.deleteBanner)
router.post('/updateBanner', adminVerify,bannersController.updateBanner)
router.post('/toggleBanner',adminVerify, bannersController.toggleBanner)

module.exports = router;