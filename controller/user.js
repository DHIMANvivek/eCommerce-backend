const Users = require('../models/users');
const Reviews = require('../models/reviews');
const faqData = require('../models/custom-website-elements/faq');
const logger = require('./../logger');
const Notification = require('../models/notifications/notifications');
const Title = require('../models/support-ticket/TicketStatus');
const Ticket = require('../models/support-ticket/supportTicket');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const address = require('../models/address');
const OffersModel = require('../models/offers');
// const webPush = require('../models/support-ticket/SupportNotificationTokens');

// const OffersModel=require('../models/offers');
const paginateResults = require('../helpers/pagination');
const ProductController = require('../controller/products');
const PaymentKeys = require('../models/custom-website-elements/paymentKeys');
async function getDetails(req, res) {
    try {
        const basicDetails = await Users.findById(req.tokenData.id);
        res.status(200).json(basicDetails)
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function updateDetails(req, res) {
    try {
        const basicDetails = await Users.findByIdAndUpdate(req.tokenData.id, req.body, { new: true });
        res.status(200).json(basicDetails)
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}


async function getActiveAddresses(req,res){

try {
      const data=await Users.aggregate([
        {$match:{_id:new mongoose.Types.ObjectId( req.tokenData.id)}},
        {$unwind:'$info.address'},
        {$match:{'info.address.status':true}},
        {$project:{'info.address':1}},
        {$group:{
            _id:'$_id',
            addresses:{$push:'$info.address'}
        }}]);



        return  new Promise((res)=>{
            res(data);
        })
  

} catch (error) {
    logger.error(error);
    return  new Promise((res,rej)=>{
        rej(0);
    })
    
}
}


async function getAddress(req, res) {
    try {
    const data=await getActiveAddresses(req);
        res.status(200).json(data[0]);
    }
    catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function getPaginatedData(req, res) {
    const modelName = req.params.model; 
    const page = parseInt(req.query.page, 1) || 1;
    const pageSize = parseInt(req.query.pageSize, 3) || 10;

    try {
      const Model = require(`../models/custom-website-elements/${modelName}`); 
      const data = await paginateResults(Model, page, pageSize);

      res.status(200).json(data);
    } catch (error) {
        logger.error(error);
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

async function addAddress(req, res) {
    try {
        console.log('req body is ',req.body);
        const findUserAddress=await getActiveAddresses(req);
if(findUserAddress.length>0 && findUserAddress[0].addresses.length==3){
    throw({message:'You cannot add more than 3 addresses'});
}

const result=await Users.findByIdAndUpdate({_id:req.tokenData.id},{$push:{'info.address':req.body}});
const response=await getActiveAddresses(req,res);
res.status(200).json(response[0].addresses);
    }
    catch (error) {
        logger.error(error);
        res.status(500).json(error)
    }
}

async function deleteAddress(req, res) {
    try {
        const updatedValue = await Users.updateOne({
            _id: req.tokenData.id,
            'info.address._id': req.body.address_id
        }, {
            $set: {
                'info.address.$.status': false
            }
        });
        res.status(200).json(updatedValue);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function updateAddress(req, res) {
    try {
        console.log('req body is ',req.body);
        const address_id = req.body._id;
        const updatedValue = await Users.updateOne({
            _id: req.tokenData.id,
            'info.address._id': new mongoose.Types.ObjectId(address_id)
        }, {
            $set: {
                'info.address.$': req.body
            }
        });


        res.status(200).json(req.body);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error)
    }
}

async function DefaultAddress(req, res) {
    try {
let FindAddress=await Users.findOne({_id:req.tokenData.id},{'info.address':1});
FindAddress.info.address[req.body.index]=(FindAddress.info.address[0]);
FindAddress.info.address[0]=(req.body.address);
await FindAddress.save();
const result=await getActiveAddresses(req);
res.status(200).json(result[0].addresses);

    } catch (error) {
        logger.error(error);
        res.status(500).json(error)
    }
}

async function getOrders(req, res) {
    try {
        res.status(200).json(userOrders);
    } catch (error) {
        logger.error(error);
        if (error.message) {
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }
}


// incomplete
async function addReview(req, res) {
    try {
        const getAllCoupons = await OffersModel.find({ $and: [{ OfferType: 'coupon' }, { userUsed: { $nin: [req.body.id] } }] });

        res.status(200).json(getAllCoupons);

    }
    catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}


// async function getCoupons(req, res) {
//     try {
//         const getAllCoupons = await OffersModel.find({ $and: [{ OfferType: 'coupon' }, { userUsed: { $nin: [req.tokenData.id] } }, { startDate: { $lte: (new Date()) } }, { "status.active": false }, { "status.deleted": false }], });
//         res.status(200).json(getAllCoupons);

//     } catch (error) {
//         res.status(500).json(error);
//     }
// }

async function usedCoupon(req, res) {
    try {
        req.body.id = new mongoose.Types.ObjectId('6513a7af4e2d06d1e0e44660');
        req.body.couponId = new mongoose.Types.ObjectId('65312dcde94dc6738db7bb21');
        const findCoupon = await OffersModel.findById(req.body.couponId);

        findCoupon.userUsed.push(req.body.id);
        await findCoupon.save();
        res.status(200).json(findCoupon);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

// async function getCoupons(req,res){
// try {
//     const getAllCoupons=await OffersModel.find({$and:[{OfferType:'coupon'},{userUsed:{$nin: [ req.body.id ] }}]});
//     res.status(200).json(getAllCoupons);

// } catch (error) {
//     res.status.json(error);
// }
// }

async function UserCoupon(req,res){
    try {
        const findCoupon=await OffersModel.findById(req.body.couponId);

        // info.adddr
        findCoupon.userId.push(req.body.userId);
        await findCoupon.save();
        res.status(200).json(findCoupon);
    } catch (error) {
        logger.error(error);
        
    }
}

async function getFaq(req , res) {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 2;

        const skip = (page - 1) * limit;

        const response = await faqData.find({}).skip(skip).limit(limit);
        if (response) {
            return res.status(200).json(response);
        }
        throw "404";
    } catch (err) {
        return res.status(404).send();
    }
}

async function sendData(req, res) {
    try {
        if (!Array.isArray(req.body) || req.body.length === 0) {
            return res.status(400).json({ error: 'Invalid request data. An array of FAQ entries is required.' });
        }

        const insertedData = await faqData.insertMany(req.body);

        res.status(201).json(insertedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while inserting FAQ data.' });
    }
}
  
module.exports = {
    getDetails,
    updateDetails,
    getAddress,
    DefaultAddress,
    usedCoupon,
    addAddress,
    deleteAddress,
    updateAddress,
    getOrders,
    getFaq,
    sendData,
    getPaginatedData,
}