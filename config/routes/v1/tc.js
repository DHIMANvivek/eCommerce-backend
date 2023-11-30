const express = require('express');
const router = express.Router();
const tcController = require('./../../../controller/custom-website-elements/tc');
const adminVerify = require('./../../../middlewares/adminVerify');

router.post('/set', adminVerify, tcController.setDocument);
router.get('/get', tcController.getDocument);

module.exports = router;