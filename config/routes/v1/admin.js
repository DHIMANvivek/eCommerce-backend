const express = require('express')
const router = express.Router();

const adminController = require('../../../controller/admin')

// Product 
router.post('/addProduct',adminController.addProduct);
router.post('/fetchProducts', adminController.fetchProducts);
// router.delete('/deleteProduct', adminController.deleteProduct);

// Product Features
router.get('/fetchProductFeatures', adminController.fetchProductDetails);
router.post('/updateProductFeature', adminController.updateProductDetails);
router.post('/deleteProductFeature', adminController.updateProductDetails);
router.post('/updateDetails', adminController.updateDetails);
router.get('/getAdminDetails', adminController.getAdminDetails);
module.exports = router;