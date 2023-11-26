const express = require('express')
const router = express.Router();
const jwtVerify=require('../../../middlewares/jwtVerify');
const OfferController=require('../../../controller/offers');
router.post('/create',OfferController.createOffer)
router.get('/get',OfferController.getOffers)
router.post('/delete',OfferController.deleteOffer)
router.post('/update',OfferController.updateOffer)
router.get('/getCoupons',OfferController.getCoupons)

router.post('/statusUpdate',OfferController.updateOfferStatus)
router.post('/search',OfferController.searchOffer)

module.exports=router;