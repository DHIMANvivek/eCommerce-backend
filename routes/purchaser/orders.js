const express = require('express')
const router = express.Router();
const orderController = require('../../controller/user/user')

router.post('/getOrdrers',orderController.getOrders)
module.exports = router;