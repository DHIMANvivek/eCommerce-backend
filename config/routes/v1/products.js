const express = require('express');
const router = express.Router();

const productsController = require('./../../../controller/products')

router.get('/all', productsController.fetchAll);
router.get('/fetch', productsController.fetchProducts);
router.get('/fetchProduct', productsController.fetchProductDetails);
router.get('/uniqueFields', productsController.fetchUniqueCategories);

module.exports = router;