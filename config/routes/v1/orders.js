const express = require('express')
const router = express.Router();
const jwtVerify=require('../../../middlewares/jwtVerify');
const orderController = require('../../../controller/orders');
const adminVerify = require('../../../middlewares/adminVerify');


router.post('/verifyOrder',jwtVerify,orderController.VerifyOrder)
router.post('/verifyOrderWithoutCoupon',orderController.VerifyOrder);
// router.use();
router.post('/create',jwtVerify,orderController.createOrder);
router.post('/update',jwtVerify,orderController.updateLatestOrderDetail)
router.get('/getparticularUserOrders',jwtVerify,orderController.getParicularUserOrders);
router.post('/cancelOrder', jwtVerify,orderController.cancelOrderedProduct );

router.post('/sellerOrders', adminVerify, orderController.getSellerOrdersInventory);
router.get('/sellerOrderDetail', adminVerify, orderController.getSellerOrderDetails);
router.post('/updateOrderStatus',jwtVerify, orderController.updateLatestOrderDetail); 
router.get('/getOrderOverallData', adminVerify, orderController.getOverallOrderData);
router.get('/getLatestOrderId' , jwtVerify , orderController.getLatestOrderId);

module.exports = router;