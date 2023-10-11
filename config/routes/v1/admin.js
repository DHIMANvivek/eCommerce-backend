const express = require('express')
const router = express.Router();

const adminController = require('../../../controller/admin')


router.use('/addProduct', adminController.addProduct);
router.use('/fetchProductFeatures', adminController.featureProductDetails);

module.exports = router;