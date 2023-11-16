const express = require('express');
const router = express.Router();
const aboutController = require('./../../../../controller/custom-website-elements/about');
const adminVerify = require('./../../../../middlewares/adminVerify');

router.post('/setDetails', aboutController.updateAboutPage)
router.get('/getDetails', aboutController.getAboutPageDetails )

module.exports = router;