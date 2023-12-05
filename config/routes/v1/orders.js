const express = require('express')
const router = express.Router();
const jwtVerify=require('../../../middlewares/jwtVerify');
const orderController = require('../../../controller/orders');
const adminVerify = require('../../../middlewares/adminVerify');



router.post('/verifyOrderWithoutCoupon',orderController.VerifyOrder);
router.use(jwtVerify);
router.post('/verifyOrder',orderController.VerifyOrder)
// router.use();
router.get('/getIndividualOrders',orderController.getIndividualOrders);
router.post('/sellerOrders', adminVerify, orderController.getSellerOrdersInventory);
router.get('/sellerOrderDetail', adminVerify, orderController.getSellerOrderDetails);
router.get('/getOrderOverallData', adminVerify, orderController.getOverallOrderData);

router.post('/create',orderController.createOrder);
router.post('/update',orderController.updateLatestOrderDetail)
router.post('/getparticularUserOrders',orderController.getParicularUserOrders);
router.post('/cancelOrderProduct',orderController.cancelOrderedProduct );
router.post('/cancelOrder',orderController.cancelOrder);
router.post('/sellerOrders', orderController.getSellerOrdersInventory);
router.get('/sellerOrderDetail', orderController.getSellerOrderDetails);
router.post('/updateOrderStatus', orderController.updateLatestOrderDetail); 
router.get('/getOrderOverallData', orderController.getOverallOrderData);
router.get('/getLatestOrderId'  , orderController.getLatestOrderId);

module.exports = router;