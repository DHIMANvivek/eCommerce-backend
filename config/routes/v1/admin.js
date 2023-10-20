const express = require('express')
const router = express.Router();

const adminController = require('../../../controller/admin')

// Product 
router.post('/addProduct',adminController.addProduct);
router.post('/updateProduct',adminController.updateProduct);
router.post('/fetchProducts', adminController.fetchProductInventory);
router.post('/deleteProducts', adminController.deleteProductInventory);
// router.delete('/deleteProduct', adminController.deleteProduct);

// Product Features
router.post('/fetchProductFeatures', adminController.fetchFeatures);
router.post('/updateProductFeature', adminController.updateFeatures);
router.post('/deleteProductFeature', adminController.updateFeatures);
router.post('/updateDetails', adminController.updateDetails);
router.get('/getAdminDetails', adminController.getAdminDetails);


//  COUPONS
router.post('/createOffer',adminController.createOffer)
router.get('/getOffers',adminController.getOffers)
router.post('/deleteOffer',adminController.deleteOffer)
// router.get('/getProductPrice',adminController.getProductPrice)

// FAQs
router.post('/deleteFaq', adminController.deleteFaq);
router.post('/updateFaq', adminController.updateFaq);
router.post('/addFaq', adminController.addFaq);

// router.get('/getFaq', adminController.getFaq);
module.exports = router;