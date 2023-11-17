const express = require('express');
const router = express.Router();
const homeLayoutController = require('../../../../controller/custom-website-elements/home-layout');
const AdminVerify = require('../../../../middlewares/adminVerify');

//admins
router.post('/updateOrCreate', AdminVerify, homeLayoutController.updateOrCreate);
router.get('/getAll', AdminVerify, homeLayoutController.fetchAll);
router.post('/delete', AdminVerify, homeLayoutController.deleteLayout);

//normal
router.get('/get', homeLayoutController.fetch);

module.exports = router;