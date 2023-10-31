const express = require('express');
const router = express.Router();
const socialsController = require('./../../../../controller/custom-website-elements/socials');
const AdminVerify = require('../../../../middlewares/adminVerify');

router.post('/set', AdminVerify, socialsController.setSocials);
router.get('/get', socialsController.getSocials);

module.exports = router;