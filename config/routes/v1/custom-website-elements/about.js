const express = require('express');
const router = express.Router();
const aboutController = require('./../../../../controller/custom-website-elements/about');
const adminVerify = require('./../../../../middlewares/adminVerify');
const about = require('../../../../models/custom-website-elements/about');

router.post('/setDetails', aboutController.updateAboutPage);
router.get('/getDetails', aboutController.getAboutPageDetails);

// router.get('/getOverAllDetails', aboutController.getOverallStatus);

module.exports = router;