const OfferModel = require('../models/offers');
const ordersModel = require('./../models/order');
const Users = require('../models/users');
const moongoose = require('mongoose');
const { verifyToken } = require('../helpers/jwt');
const mailer = require('../helpers/nodemailer')
const { sendDiscountTemplate} = require('../helpers/INDEX');
const logger = require('./../logger');

function createQuery(req) {
  let query = {};
  req.body = JSON.parse(JSON.stringify(req.body));
  if (req.body?.ExtraInfo?.categories && req.body.ExtraInfo.categories.length == 0) {
    req.body.ExtraInfo.categories = null;
  }

  if (req.body?.ExtraInfo?.brands && req.body?.ExtraInfo.brands.length == 0) {
    req.body.ExtraInfo.brands = null;
  }

  //  GLOBAL QUERY 
  if (!req.body?.ExtraInfo?.brands && !req.body?.ExtraInfo?.categories) {
    query['ExtraInfo.categories'] = null,
      query['ExtraInfo.brands'] = null
  }

  if (req.body?.ExtraInfo.brands && req.body?.ExtraInfo?.categories) {
    query['ExtraInfo.brands'] = {$in:req.body.ExtraInfo.brands};
    query['ExtraInfo.categories'] = {$in:req.body.ExtraInfo.categories};
  }

 

  else if (req.body?.ExtraInfo?.brands && !req.body?.ExtraInfo?.categories) {
    query = {
      $and: [
        { 'ExtraInfo.brands': {$in:req.body.ExtraInfo.brands} },  // At least one of these brands must be present
        { 'ExtraInfo.categories': null }
      ]
    }
  }

  else if (!req.body?.ExtraInfo?.brands && req.body?.ExtraInfo?.categories) {
    query = {
      $and: [
        { 'ExtraInfo.brands': null },
        { 'ExtraInfo.categories': {$in:req.body.ExtraInfo.categories} }
      ]
    }
  }

  query['status.active'] = true;
  query.OfferType = 'discount';

  let newquery = {
    $or: [
      { startDate: { $gte: req.body.startDate, $lte: req.body.endDate } },
      { endDate: { $gte: req.body.startDate, $lte: req.body.endDate } },
      { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.endDate } }
    ]


  }

  Object.assign(query, newquery);
  return query;
}

async function createOffer(req, res) {
  try {
    if (req.body.OfferType == 'discount') {
      req.body.Link = generateLink(req);
      let query = createQuery(req);


      let results = await OfferModel.find(query);

      for (let result of results) {
        if (result && result._id != req.body.id) {
          if (result.status.active) {
            req.body.status = { deleted: false, active: false };
          }
        }
      }
    }


    const newOffer = OfferModel(req.body);
    await newOffer.save();
    res.status(200).json(newOffer);
  } catch (error) {
    console.log('error comnig is ',error);
    res.status(500).json(error);
  }
}
async function getOffers(req, res) {
  try {
    
   let parameters =req.body; 
    const skip =  (parameters.currentPage - 1) * parameters.limit ;
    const limit= parameters.limit;
    
    const query = { $regex: parameters.search, $options: "i" };
    let aggregationPipe = [
      {
        $match: {
          "status.deleted": false,
          $or: [
            { OfferType: query },
            { discountType: query },
            { Title: query },
            { couponcode: query },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
          document: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $project: {
          count: 1,
          document: { $slice: ['$document', skip, limit] },
        },
      }
    ];
    

    const data=await OfferModel.aggregate(aggregationPipe);
    console.log('data come up is ',data);
    res.status(200).json(data);

  } catch (error) {
    logger.error(error);
    res.status(500).json({message:'Internal Server Error'});

  }
}


async function deleteOffer(req, res) {
  try {
    if (Array.isArray(req.body)) {
      await OfferModel.updateMany({ _id: { $in: req.body } }, { $set: { "status.deleted": true } });
    }

    else {
      await OfferModel.updateOne({ _id: req.body.id }, { $set: { "status.deleted": true } });
    }

    const data = await OfferModel.find({ 'status.deleted': false }).sort({ createdAt: -1 });

    return res.status(200).json(data);
  } catch (error) {
    logger.error(error);
    res.status(500).json(error);
  }
}


function generateLink(req) {
  let link = 'http://localhost:4200/explore?'

  for (let i = 0; i < req.body.ExtraInfo?.brands?.length; i++) {
    let value = req.body.ExtraInfo.brands[i];
    value = value[0].toLowerCase() + value.slice(1)
    if (value.includes(' ')) {
      value = value.split(' ');
      value = value[0] + '%20' + value.slice(1);
    }

    if (i == 0) {
      link += 'brand' + '=' + value;
    }
    else {
      link += '&' + 'brand' + '=' + value;
    }
  }

  for (let i = 0; i < req.body.ExtraInfo?.categories?.length; i++) {
    let value = req.body.ExtraInfo.categories[i];
    value = value[0].toLowerCase() + value.slice(1)

    if (link.includes('brand') && i == 0) {
      link += '&';
    }
    if (value.includes(' ')) {
      value = value.split(' ');
      value = value[0] + '%20' + value.slice(1);
    }
    if (i == 0) {
      link += 'category' + '=' + value;
    }
    else {
      link += '&' + 'category' + '=' + value;
    }
  }

  return link;
}


async function updateOffer(req, res) {
  try {
    if (req.body.OfferType == 'discount') {
      req.body.Link = generateLink(req);
      let query = createQuery(req);
      req.body['status.active'] = true;
      let results = await OfferModel.find(query);
      for (let result of results) {
        if (result && result._id != req.body.id) {
          if (result.status.active) {
            req.body['status.active'] = false;
          }
        }
      }
    }
    
    result = await OfferModel.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
    res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json(error);
  }
}

async function updateOfferStatus(req, res) {
  try {
    let status = req.body.status;
    req.body = req.body.data;
    if (req.body.OfferType == 'discount' && status) {
      let query = createQuery(req);
      let results = await OfferModel.find(query);

      for (let result of results) {
        result = JSON.parse(JSON.stringify(result));
        console.log('result coming is ', result);
        if (result && result._id != req.body._id) {
          throw { message: 'This is conflict point please try to create another date points ' };
        }
      }

    }

    if (!status) {
      req.body.status = false;
    }
    const updateOfferStatus = await OfferModel.updateOne({ _id: req.body._id }, {
      $set: { 'status.active': status }
    })
    res.status(200).json({ message: 'offer status updated sucess' })
  } catch (error) {
    logger.error(error);
    res.status(500).json(error)
  }
}

async function getCoupons(req, res) {
  try {

    let query = {
      OfferType: 'coupon',
      "status.active": true,
      "status.deleted": false,
      startDate: { $lte: (new Date()) },
      endDate: { $gte: (new Date()) },

    };

    let user;

    if (req.headers.authorization) {
      data = verifyToken(req.headers.authorization.split(' ')[1])
      query.userUsed = { $nin: [data.id] }
      let checkNewUser = await ordersModel.findOne({ buyerId: data.id });

      if (checkNewUser) {
        query.couponType = { $nin: ['new'] };
      }
      query.userUsed = { $nin: [data.id] }
      user = await Users.findOne({ _id: data.id }, { email: 1, _id: 0 });
    };


    const getAllCoupons = await OfferModel.aggregate([
      {$match: query},
      {$match:  {$or:[
        { couponType: 'custom', 'UserEmails.email': {$in:[user?.email]} }
        ,{couponType:{$in:['global','new']}}]}}
  ])

  res.status(200).json(getAllCoupons);

} catch (error) {
  logger.error(error);
  res.status(500).json(error);
}
}

async function checkCoupon(couponId, userId) {
  try {

    const response = await OfferModel.findOne({
      $and: [
        { OfferType: 'coupon' },
        { _id: couponId },
        { userUsed: { $nin: [userId] } },
        { startDate: { $lte: new Date() } },
        { endDate: { $gte: new Date() } },
        { 'status.active': true }
      ]
    });


    if (response?.couponUsersLimit <= 0) {
      response = null;
    }

    return new Promise((res, rej) => {
      if (!response) res(0);
      res(response);
    })

  } catch (error) {
    logger.error(error);
  }
}

async function updateCoupon(couponId, userId) {
  try {
    const response = await OfferModel.findOneAndUpdate({ _id: couponId, userUsed: { $nin: [userId] } }, { $push: { userUsed: (userId) } });
    return new Promise((res, rej) => {
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

  updateOfferStatus,
  getCoupons,
  updateOffer,
  checkCoupon
}