const express = require('express');
const router = express.Router();
const socialsController = require('./../../../../controller/custom-website-elements/socials');
const AdminVerify = require('../../../../middlewares/adminVerify');
const checkRedisCache = require('./../../../../middlewares/redis');

router.post('/set', AdminVerify, socialsController.setSocials);
router.get('/get', socialsController.getSocials);
router.get('/getInstagram', checkRedisCache,socialsController.getInstagramMedia);

module.exports = router;