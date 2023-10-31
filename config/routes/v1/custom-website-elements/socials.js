const express = require('express');
const router = express.Router();
const socialsController = require('./../../../../controller/custom-website-elements/socials');

router.post('/set', socialsController.setSocials);
router.get('/get', socialsController.getSocials);

module.exports = router;