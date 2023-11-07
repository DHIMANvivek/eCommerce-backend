const express = require('express');
const router = express.Router();
const dealsController = require('./../../../../controller/custom-website-elements/deals');
const adminVerify = require('./../../../../middlewares/adminVerify');

router.post('/set', dealsController.updateDealsPage)
router.get('/getDetails', dealsController.getDealsPageDetails )

module.exports = router;