const OfferModel = require('../models/offers');
const moongoose = require('mongoose');

function createQuery(req) {
  let query;
  req.body = JSON.parse(JSON.stringify(req.body));
  if (req.body.ExtraInfo.categories && req.body.ExtraInfo.categories.length == 0) {
    req.body.ExtraInfo.categories = null;
  }

  if (req.body.ExtraInfo.brands && req.body.ExtraInfo.brands.length == 0) {
    req.body.ExtraInfo.brands = null;
  }
  if (req.body.ExtraInfo.brands && req.body.ExtraInfo.categories) {
    query = {
      $and: [
        { 'ExtraInfo.brands': { $in: req.body.ExtraInfo.brands } },  // At least one of these brands must be present
        { 'ExtraInfo.categories': { $in: req.body.ExtraInfo.categories } },
      ]
    }
  }

  else if (req.body.ExtraInfo.brands && !req.body.ExtraInfo.categories) {
    query = {
      $and: [
        { 'ExtraInfo.brands': { $in: req.body.ExtraInfo.brands } },  // At least one of these brands must be present
        { 'ExtraInfo.categories': null }
      ]
    }
  }

  else if (!req.body.ExtraInfo.brands && req.body.ExtraInfo.categories) {
    query = {
      $and: [
        { 'ExtraInfo.brands': null }, 
        { 'ExtraInfo.categories': { $in: req.body.ExtraInfo.categories } }
      ]
    }
  }

  //   else{
  //     query={
  //       $and: [
  //         { 'ExtraInfo.brands':  req.body.ExtraInfo.brands  }, 
  //         { 'ExtraInfo.categories': req.body.ExtraInfo.categories }
  //     ]
  // }
  //   }


  if (!query) {
    query = {};
    query.global = true;
  }
  // query.endDate={$gte:req.body.startDate};
  // query['status.active']=true;
  // query.startDate={$or:[{$gte:req.body.startDate},{$lte:req.body.endDate}]}
  // query.endDate={$or:[{$gte:req.body.startDate},{$lte:req.body.endDate}]}
  // query.startDate = { $lte: req.body.startDate };
  // query.endDate = { $gte: req.body.startDate };

  let newquery={
    $or:[
      {startDate:{$gte:req.body.startDate,$lte:req.body.endDate}},
      {endDate:{$gte:req.body.startDate,$lte:req.body.endDate}},
      {startDate:{$lte:req.body.startDate},endDate:{$gte:req.body.endDate}}
    ]


  }

  Object.assign(query, newquery);
  return query;
}
async function createOffer(req, res) {
  try {
    let result;
    if (req.body.OfferType == 'discount') {
      req.body.Link=generateLink(req);
      let query = createQuery(req);

        if (query.global) {
          let extraKey = {
            OfferType: 'discount',
            'ExtraInfo.categories': {$eq: null}, 'ExtraInfo.brands': {$eq: null}
          }
          delete query.global;
          Object.assign(query, extraKey);
          // result = await OfferModel.findOne(query);
        }
    
        // result = await OfferModel.findOne(query);
      query.OfferType='discount';
      console.log('query come up is ',query);
      result = await OfferModel.findOne(query);

      if (result) {
        throw { message: 'This is conflict point please try to create another date points ' };
      }

    }
    const newOffer = OfferModel(req.body);
    await newOffer.save();
    res.status(200).json(newOffer);
  } catch (error) {
    console.log('error coming is ', error);
    res.status(500).json(error);
  }
}


async function getOffers(req, res) {
  try {
    const data = await OfferModel.find({ 'status.deleted': false }).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
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
    res.status(500).json(error);
  }
}


function generateLink(req){
  let link='http://localhost:4200/explore?'
  for(let i=0;i<req.body.ExtraInfo?.brands?.length;i++){
    let value=req.body.ExtraInfo.brands[i];
    value=value[0].toLowerCase()+value.slice(1)
    if(value.includes(' ')){
      value=value.split(' ');
      value=value[0]+'%20'+value.slice(1);
    }
    if(i==0){
      link+='brand'+'='+value;
    }
    else{
      link+='&'+'brand'+'='+value;
    }
  }

  for(let i=0;i<req.body.ExtraInfo?.categories?.length;i++){
    let value=req.body.ExtraInfo.categories[i];
    value=value[0].toLowerCase()+value.slice(1)

    if(link.includes('brand') && i==0){
      link+='&';
    }
    if(value.includes(' ')){
      value=value.split(' ');
      value=value[0]+'%20'+value.slice(1);
    }
    if(i==0){
      link+='category'+'='+value;
    }
    else{
      link+='&'+'category'+'='+value;
    }
  }

  return link;
}


async function updateOffer(req, res) {
  try {
    
    if (req.body.OfferType == 'discount') {
      req.body.Link=generateLink(req);
      let query = createQuery(req);

        if (query.global) {
          let extraKey = {
            OfferType: 'discount',
            'ExtraInfo.categories':  null, 'ExtraInfo.brands': null
          }
          delete query.global;
          Object.assign(query, extraKey);
        }
    
      query.OfferType='discount';
      let results= await OfferModel.find(query);
      
      for(let result of results){
        if (result && result._id!=req.body.id) {
          throw { message: 'This is conflict point please try to create another date points ' };
        }
      }
    

    }
    if(req.body.ExtraInfo?.brands?.length==0){
      req.body.ExtraInfo.brands=null;
    }
    if(req.body.ExtraInfo?.categories?.length==0){
      req.body.ExtraInfo.categories=null;
    }

    result = await OfferModel.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
    res.status(200).json(result);
  } catch (error) {
    console.log('errpr cpmogn is ',error);
    res.status(500).json(error);
  }
}


async function updateOfferStatus(req, res) {
  try {
    let status = req.body.status;
    req.body = req.body.data;
    if (req.body.OfferType == 'discount') {
      let query = createQuery(req);
      query['status.active'] = true;
      if (query.global) {
        let extraKey = {
          OfferType: 'discount',
          'ExtraInfo.categories': {$eq: null}, 'ExtraInfo.brands': {$eq: null}
        }
        delete query.global;
        Object.assign(query, extraKey);
        // result = await OfferModel.findOne(query);
      }
     
      let results = await OfferModel.find(query);
      console.log('result coming is ',results);
      for(let result of results){
        result = JSON.parse(JSON.stringify(result));
        if (result && result._id != req.body._id) {
          throw { message: 'This is conflict point please try to create another date points ' };
        }
      }
    
    }

    const updateOfferStatus = await OfferModel.updateOne({ _id: req.body._id }, {
      $set: { 'status.active': status }
    })
    res.status(200).json({ message: 'offer status updated sucess' })
  } catch (error) {
    console.log('error coming si ', error);
    res.status(500).json(error)
  }
}

async function getCoupons(req, res) {
  try {
    const getAllCoupons = await OfferModel.find(
      {
        $and: [
          { OfferType: 'coupon' },
          { "status.active": true },
          { "status.deleted": false },
          { startDate: { $lte: (new Date()) } },
          { endDate: { $gte: (new Date()) } },
        ]
      });
    res.status(200).json(getAllCoupons);

  } catch (error) {
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
        // {$gte:{'couponUsersLimit':1}},
        { couponUsersLimit: { $gte: 1 } },
        { UserEmails: { $nin: [userId] } },
        {startDate:{$lte:new Date()}},
        {endDate:{$gte:new Date()}},
        {'status.active':true}
      ]
    });

    return new Promise((res, rej) => {
      if (!response) res(0);
      res(response);
    })

  } catch (error) {
  }
}

async function updateCoupon(couponId, userId) {
  try {
    const response = await OfferModel.findOneAndUpdate({ _id: couponId, userUsed: { $nin: [userId] } }, { $push: { userUsed: new moongoose.Types.ObjectId(userId) } }, { new: true });
    return new Promise((res, rej) => {
      res(response);
    })

  } catch (error) {
  }
}



async function searchOffer(req, res) {
  try {
    const query = { $regex: req.body.searchWord, $options: "i" };
    const findsearchedOffers = await OfferModel.find(


      {
        'status.deleted': false,
        // 'status.active': true,
        $or: [
          { OfferType: query },
          { discountType: query },
          { Title: query },
          { couponcode: query },

        ]
      }
    )

    console.log('findSearch offer is ', findsearchedOffers);
    res.status(200).json(findsearchedOffers);

  } catch (error) {
    res.status(500).json(error);
  }
}


module.exports = {
  createOffer,
  getOffers,
  updateCoupon,
  deleteOffer,
  searchOffer,
  updateOfferStatus,
  getCoupons,
  updateOffer,
  checkCoupon
}