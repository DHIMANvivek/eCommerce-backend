const OfferModel = require('../models/offers');
const moongoose=require('mongoose');
async function createOffer(req, res) {
  try {
    const offer = await OfferModel(req.body);
    await offer.save();
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json(error);
  }
}


async function getOffers(req, res) {
  try {
    const data = await OfferModel.find({ 'status.deleted': false });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}


async function deleteOffer(req, res) {
  try {
    const offerdeleted = await OfferModel.updateOne({ _id: req.body.id }, { $set: { "status.deleted": true } });
    res.status(200).json({ message: 'Deleted Successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
}


async function updateOffer(req, res) {
  try {
    const result = await OfferModel.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
    res.status(200).json(result);
  } catch (error) {
    console.log('error is ', error);
    res.status(500).json(error);
  }
}


async function getCoupons(req, res) {
  try {
    const getAllCoupons = await OfferModel.find({ $and: [{ OfferType: 'coupon' },{ "status.active": true },{ "status.deleted": false} ,{ startDate: { $lte: (new Date()) } }, {endDate:{$gte:(new Date())}}] });
    res.status(200).json(getAllCoupons);

  } catch (error) {
    res.status(500).json(error);
  }
}

async function checkCoupon(couponId,userId){
  try {
    const response=await OfferModel.findOne({ $and:[{ OfferType: 'coupon' },{_id:couponId},{ userUsed:{$nin: [userId]}},{$gte:{'couponUsersLimit':1}}]});
    return new Promise((res,rej)=>{
      if(!response) res(0);
      res(response);
    })

  } catch (error) {
  
  }
}

async function updateCoupon(couponId,userId){
  try {
    const response=await OfferModel.findOneAndUpdate({_id:couponId,userUsed:{$nin: [userId]}},{$push:{userUsed:new moongoose.Types.ObjectId(userId)}},{new:true});
    return new Promise((res,rej)=>{
      res(response);
    })

  } catch (error) {
  }
}


module.exports = {
  createOffer,
  getOffers,
  updateCoupon,
  deleteOffer,
  getCoupons,
  updateOffer,
  checkCoupon
}