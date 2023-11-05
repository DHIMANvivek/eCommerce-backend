const express = require('express')
const router = express.Router();
const jwtVerify=require('../../../middlewares/jwtVerify');
const orderController = require('../../../controller/orders');
const adminVerify = require('../../../middlewares/adminVerify');

router.post('/', orderController.getOrders);
router.post('/verifyOrderSummary',jwtVerify,orderController.verifyOrderSummary)
router.use(jwtVerify);
router.post('/create',orderController.createOrder);
router.get('/getparticularUserOrders',orderController.getParicularUserOrders);

router.post('/sellerOrders', adminVerify, orderController.getSellerOrdersInventory);
router.get('/sellerOrderDetail', adminVerify, orderController.getSellerOrderDetails);
router.post('/updateOrderStatus', orderController.updateLatestOrderDetail); 
router.post('/latestOrder', orderController.getLatestProductForBuyer);
router.get('/getOrderOverallData', adminVerify, orderController.getOverallOrderData);

router.post('/updateOrderStatus', orderController.getLatestOrderDetail); 

module.exports = router;