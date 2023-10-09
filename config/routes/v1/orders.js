const express = require('express')
const router = express.Router();
const orderController = require('../../../controllers/orders')

router.post('/getOrdrers',orderController.getOrders)
module.exports = router;