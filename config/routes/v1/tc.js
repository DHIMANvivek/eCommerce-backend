const express = require('express');
const router = express.Router();
const tcController = require('./../../../controller/custom-website-elements/tc');
const jwtVerify = require('./../../../middlewares/jwtVerify');

router.post('/set', tcController.setDocument);
router.get('/get', tcController.getDocument);

module.exports = router;