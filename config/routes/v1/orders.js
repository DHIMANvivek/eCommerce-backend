const express = require('express')
const router = express.Router();
const jwtVerify=require('../../../middlewares/jwtVerify');
const orderController = require('../../../controller/orders')

router.post('/', orderController.getOrders);
router.use(jwtVerify);
router.post('/create',orderController.CreateOrder)
module.exports = router;