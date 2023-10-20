const express = require('express');
const router = express.Router();

const productsController = require('./../../../controller/products');

router.get('/all', productsController.fetchAll);
router.get('/fetch', productsController.fetchProducts);
router.get('/fetchProduct', productsController.fetchProductDetails);
router.post('/uniqueFields', productsController.fetchUniqueFields);
router.get('/getOriginalPrice',productsController.getProductPrice);

module.exports = router;