const express = require('express');
const router = express.Router();
const salesController = require('./../../../../controller/custom-website-elements/sales');
const adminVerify = require('./../../../../middlewares/adminVerify');

router.post('/setSales', salesController.setSales)
router.get('/getSales', salesController.getSales )
router.post('/toggle' , adminVerify , salesController.toggle)
router.post('/update' , adminVerify , salesController.updateItem)
router.post('/delete', adminVerify ,salesController.deleteSale)

module.exports = router;