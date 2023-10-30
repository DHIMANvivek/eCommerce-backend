const express = require('express')
const router = express.Router();
const jwtVerify=require('../../../middlewares/jwtVerify');
const orderController = require('../../../controller/orders')

router.post('/', orderController.getOrders);
router.post('/verifyOrderSummary',orderController.verifyOrderSummary)
router.use(jwtVerify);
router.post('/create',orderController.createOrder);
router.get('/getparticularUserOrders',orderController.getParicularUserOrders);
module.exports = router;