const OfferModel = require('../models/offers');
const ordersModel = require('./../models/order');
const Users = require('../models/users');
const moongoose = require('mongoose');
const { verifyToken } = require('../helpers/jwt');
const mailer = require('../helpers/nodemailer')
const { sendDiscountTemplate} = require('../helpers/INDEX');
const logger = require('./../logger');

// function createQuery(req) {
//   let query = {};
//   // req.body = JSON.parse(JSON.stringify(req.body));
//   if (req.body?.ExtraInfo?.categories && req.body.ExtraInfo.categories.length == 0) {
//     req.body.ExtraInfo.categories = null;
//   }

//   if (req.body?.ExtraInfo?.brands && req.body?.ExtraInfo.brands.length == 0) {
//     req.body.ExtraInfo.brands = null;
//   }

//   //  GLOBAL QUERY 
//   if (!req.body?.ExtraInfo?.brands && !req.body?.ExtraInfo?.categories) {
//     query['ExtraInfo.categories'] = null,
//       query['ExtraInfo.brands'] = null
//   }

//   if (req.body?.ExtraInfo?.brands && req.body?.ExtraInfo?.categories) {
//     query['ExtraInfo.brands'] = {$in:req.body.ExtraInfo.brands};
//     query['ExtraInfo.categories'] = {$in:req.body.ExtraInfo.categories};
//   }

 

//   else if (req.body?.ExtraInfo?.brands && !req.body?.ExtraInfo?.categories) {
//     query = {
//       $and: [
//         { 'ExtraInfo.brands': {$in:req.body.ExtraInfo.brands} },  // At least one of these brands must be present
//         { 'ExtraInfo.categories': null }
//       ]
//     }
//   }

//   else if (!req.body?.ExtraInfo?.brands && req.body?.ExtraInfo?.categories) {
//     query = {
//       $and: [
//         { 'ExtraInfo.brands': null },
//         { 'ExtraInfo.categories': {$in:req.body.ExtraInfo.categories} }
//       ]
//     }
//   }

//   query['status.active'] = true;
//   query.OfferType = 'discount';

//   let newquery = {
//     $or: [
//       { startDate: { $gte: req.body.startDate, $lte: req.body.endDate } },
//       { endDate: { $gte: req.body.startDate, $lte: req.body.endDate } },
//       { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.endDate } }
//     ]


//   }

//   Object.assign(query, newquery);
//   return query;
// }
function createQuery(req) {
  let query = {
    'status.active': true,
    'status.deleted':false,
    OfferType: 'discount',
  };

  if (req.body?.ExtraInfo?.categories) {
    query['ExtraInfo.categories'] = req.body.ExtraInfo.categories.length > 0 ? { $in: req.body.ExtraInfo.categories } : null;
  }

  if (req.body?.ExtraInfo?.brands) {
    query['ExtraInfo.brands'] = req.body.ExtraInfo.brands.length > 0 ? { $in: req.body.ExtraInfo.brands } : null;
  }

  if (query['ExtraInfo.brands'] && query['ExtraInfo.categories']) {
    query.$and = [
      { 'ExtraInfo.brands': query['ExtraInfo.brands'] },
      { 'ExtraInfo.categories': query['ExtraInfo.categories'] },
    ];
    // Remove the individual properties from the query
    delete query['ExtraInfo.brands'];
    delete query['ExtraInfo.categories'];
  } else if (query['ExtraInfo.brands']) {
    // Only brands are specified
    query.$and  = [{ 'ExtraInfo.brands': query['ExtraInfo.brands'] }, { 'ExtraInfo.categories': null }];
    delete query['ExtraInfo.brands'];
  } else if (query['ExtraInfo.categories']) {
    // Only categories are specified
    query.$and  = [{ 'ExtraInfo.brands': null }, { 'ExtraInfo.categories': query['ExtraInfo.categories'] }];
    delete query['ExtraInfo.categories'];
  }

  const dateQuery = {
    $or: [
      { startDate: { $gte: req.body.startDate, $lte: req.body.endDate } },
      { endDate: { $gte: req.body.startDate, $lte: req.body.endDate } },
      { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.endDate } },
    ],
  };

  Object.assign(query, dateQuery);

  return query;
}


async function createOffer(req, res) {
  try {

    if (req.body.OfferType == 'discount') {
      // req.body.Link = generateLink(req);
      let query = createQuery(req);
      let results = await OfferModel.find(query);
      for (let result of results) {
        if (result && result._id != req.body.id) {
          if (result.status.active) {
            req.body.status={active:false,deleted:false};
          }
        }
      }
    }

    const newOffer = OfferModel(req.body);
    await newOffer.save();
    res.status(200).json(newOffer);
  } catch (error) {
    console.log('error is ',error);
    logger.error(error);
    res.status(500).json(error);
  }
}


async function getOffersCommon(req,res,parameterGiven=false){
  try {
    console.log('req body come up in getOffer common ',parameterGiven);
    let parameters;
    if(parameterGiven){
      parameters=parameterGiven;
    }
    else{
      parameters =req.body; 
    }
     console.log('parameter sis ',parameters);
    const skip =  (parameters.currentPage - 1) * parameters.limit ;
    const limit= parameters.limit;
    
    const query = { $regex: parameters.search, $options: "i" };
    let aggregationPipe = [
      {
        $match: {
          "status.deleted": false,
          "status.active":parameters.active,
          $or: [
            { OfferType: query },
            { discountType: query },
            { Title: query },
            { couponCode: query },
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
    return new Promise((res,rej)=>{
     res( data);
    })
  } catch (error) {
    
  }
}

async function getOffers(req, res) {
  try {
        const data=await getOffersCommon(req,res);
    res.status(200).json(data);

  } catch (error) {
    logger.error(error);
    res.status(500).json({message:'Internal Server Error'});

  }
}


async function deleteOffer(req, res) {
  try {
    
    if (Array.isArray(req.body.data)) {
      await OfferModel.updateMany({ _id: { $in: req.body.data } }, { $set: { "status.deleted": true } });
    }

    else {
      await OfferModel.updateOne({ _id: req.body.id }, { $set: { "status.deleted": true } });
    }

    const data=await getOffersCommon(req,res,req.body.parameters);
    return res.status(200).json({message:'Delted offer sucess',data})
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
      // req.body.Link = generateLink(req);
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

      req.body.userUsed = null;
      req.body.UserEmails = null;
      req.body.couponType=null;
      req.body.couponCode=null;
      req.body.couponUsersLimit=null;
      req.body.minimumPurchaseAmount=null;
    }
    
  
    if(req.body.OfferType=='coupon'){
        req.body.ExtraInfo=null;
        req.body['status.active'] = true;
        req.body.userUsed=[];
        if(req.body.couponType!='custom'){
            req.body.UserEmails=null;
           
        }
        else{
            req.body.couponUsersLimit=null;
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
    console.log('body is ',req.body);
    let status = req.body.status;
    let parameters=req.body.parameters;
    req.body = req.body.data;
    if (req.body.OfferType == 'discount' && status) {
      let query = createQuery(req);
      let results = await OfferModel.find(query);

      for (let result of results) {
        if (result && result._id != req.body._id) {
          console.log('result is ',result," req body is  ",req.body);
          throw { message: `Your Current discount is conflicting with ${result.Title}` };
        }
      }

    }

  
    const updateOfferStatus = await OfferModel.updateOne({ _id: req.body._id }, {
      $set: { 'status.active': status }
    })

    let data=await getOffersCommon(req,res,parameters);
    if(!data.length){
      data=[];
    }
    res.status(200).json({ message: 'offer status updated sucess',data:data })
  } catch (error) {
    console.log('error come up is ',error);
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
    let tokenData;

    if (req.headers.authorization) {
      tokenData = verifyToken(req.headers.authorization.split(' ')[1])
      let checkNewUser = await ordersModel.findOne({ buyerId: tokenData.id });

      if (checkNewUser) {
        query.couponType = { $nin: ['new'] };
      }

      user = await Users.findOne({ _id: tokenData.id }, { email: 1, _id: 0 });
    };

    const getAllCoupons = await OfferModel.aggregate([
      {
        $match: query,
      },
      {
        $match: {
          $or: [
            { couponType: 'custom', 'UserEmails.email': { $in: [user?.email] } },
            {
              couponType: { $in: ['global', 'new'] },
              userUsed: { $not: { $in: [(tokenData?.id)] } },
            },
          ],
        },
      },
    ]);
    
    console.log('getCoupons is ',getAllCoupons);

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
    const response = await OfferModel.findOneAndUpdate({ _id: couponId, userUsed: { $nin: [userId] } }, { $push: { userUsed: (userId) },$inc:{couponUsersLimit:-1} });
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