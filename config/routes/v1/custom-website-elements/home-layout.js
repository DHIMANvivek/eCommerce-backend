const express = require('express');
const router = express.Router();
const homeLayoutController = require('../../../../controller/custom-website-elements/home-layout');
const AdminVerify = require('../../../../middlewares/adminVerify');

//admins
router.post('/updateOrCreate', homeLayoutController.updateOrCreate);
router.get('/getAll', homeLayoutController.fetchAll);

//normal
router.get('/get', homeLayoutController.fetch);

module.exports = router;