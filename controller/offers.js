const OfferModel = require('../models/offers');
const moongoose=require('mongoose');

function createQuery(req){
  let query;
  req.body=JSON.parse(JSON.stringify(req.body));
  if(req.body.ExtraInfo.categories && req.body.ExtraInfo.categories.length==0){
    req.body.ExtraInfo.categories=null;
  }

  if(req.body.ExtraInfo.brands && req.body.ExtraInfo.brands.length==0){
    req.body.ExtraInfo.brands=null;
  }
  if(req.body.ExtraInfo.brands && req.body.ExtraInfo.categories){
    query={
      $and: [
                  { 'ExtraInfo.brands': { $in: req.body.ExtraInfo.brands } },  // At least one of these brands must be present
                  { 'ExtraInfo.categories':  { $in: req.body.ExtraInfo.categories } },
              ]
    }
  }

  else if(req.body.ExtraInfo.brands && !req.body.ExtraInfo.categories){
    query={
              $and: [
                { 'ExtraInfo.brands': { $in: req.body.ExtraInfo.brands } },  // At least one of these brands must be present
                { 'ExtraInfo.categories': req.body.ExtraInfo.categories  }
            ]
       }
  }

  else if(!req.body.ExtraInfo.brands && req.body.ExtraInfo.categories){
    query={
              $and: [
                { 'ExtraInfo.brands':  req.body.ExtraInfo.brands  },  // At least one of these brands must be present
                { 'ExtraInfo.categories': { $in: req.body.ExtraInfo.categories }  }
            ]
       }
  }

  else{
    query={
      $and: [
        { 'ExtraInfo.brands':  req.body.ExtraInfo.brands  }, 
        { 'ExtraInfo.categories': req.body.ExtraInfo.categories }
    ]
}
  }

  
  // query.endDate={$gte:req.body.startDate};
  // query['status.active']=true;
  // query.startDate={$or:[{$gte:req.body.startDate},{$lte:req.body.endDate}]}
  // query.endDate={$or:[{$gte:req.body.startDate},{$lte:req.body.endDate}]}
  query.startDate={$lte:req.body.startDate};
  return query;
}
async function createOffer(req,res){
  try {

    if(req.body.OfferType=='discount'){
      let query=createQuery(req);
      const result=await OfferModel.findOne(query);
      // if(result.length>0){
      //   throw{message:'This is conflict point please try to create another date points '};
      // }  
      if(result){
        throw{message:'This is conflict point please try to create another date points '};
      }

    }

    const newOffer =  OfferModel(req.body);
    await newOffer.save();
    res.status(200).json(newOffer);
  } catch (error) {
        res.status(500).json(error);
  }
}


async function getOffers(req, res) {
  try {
    const data = await OfferModel.find({ 'status.deleted': false }).sort({createdAt:-1});
    res.status(200).json(data);
  } catch (error) {
    console.log('error si ',error);
    res.status(500).json(error);
  }
}


async function deleteOffer(req, res) {
  try {
    if(Array.isArray(req.body)){
      await OfferModel.updateMany({_id: {$in: req.body}},{ $set: { "status.deleted": true } });
    }

    else{
      await OfferModel.updateOne({ _id: req.body.id }, { $set: { "status.deleted": true } });
    }

    const data = await OfferModel.find({ 'status.deleted': false }).sort({createdAt:-1});

    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}


async function updateOffer(req, res) {
  try {
    // const query=createQuery(req);
    // let result=await OfferModel.findOne(query); 
    // result=JSON.parse(JSON.stringify(result));
    // if( result && result._id!=req.body.id){
    //   throw{message:'This is conflict point please try to create another date points '};
    // }

     result = await OfferModel.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
    res.status(200).json(result);
  } catch (error) {
    console.log('error is ', error);
    res.status(500).json(error);
  }
}


async function updateOfferStatus(req,res){
  try {
    let status=req.body.status;
    req.body=req.body.data;
    if(req.body.OfferType=='discount'){
      let query=createQuery(req);
    query['status.active']=true;
    console.log('quer is -------> ',query);
      let result=await OfferModel.findOne(query);
      result=JSON.parse(JSON.stringify(result));
      console.log('result come up si ',result," req bodycome us ",req.body);
      if( result && result._id!=req.body._id){
        throw{message:'This is conflict point please try to create another date points '};
      } 
    }

    const updateOfferStatus=await OfferModel.updateOne({_id:req.body._id},{
      $set:{'status.active':status}
    })
    res.status(200).json({message:'offer status updated sucess'})
  } catch (error) {
    console.log('error coming si ',error);
    res.status(500).json(error)
  }
}

async function getCoupons(req, res) {
  try {
    const getAllCoupons = await OfferModel.find(
      { $and: [
        { OfferType: 'coupon' },
        { "status.active": true },
        { "status.deleted": false} ,
        { startDate: { $lte: (new Date()) } }, 
        {endDate:{$gte:(new Date())}},
      ] });
    res.status(200).json(getAllCoupons);

  } catch (error) {
    res.status(500).json(error);
  }
}

async function checkCoupon(couponId,userId){
  try {
    const response=await OfferModel.findOne({ $and:[
      { OfferType: 'coupon' },
      {_id:couponId},
      { userUsed:{$nin: [userId]}},
      // {$gte:{'couponUsersLimit':1}},
      {couponUsersLimit:{$gte:1}},
      {UserEmails:{$nin:[userId]}}
    ]});
    console.log('response is ',response);
    return new Promise((res,rej)=>{
      if(!response) res(0);
      res(response);
    })

  } catch (error) {
    console.log('error coming inside checkcoupo is -----> ',error);
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



async function searchOffer(req,res){
  try {
    const query={$regex:req.body.searchWord,$options:"i"}  ;
    const findsearchedOffers=await OfferModel.find(

    
   {  
    'status.deleted':false,
    'status.active':true,
    $or:[
   { OfferType:query},
   { discountType:query},
   {Title:query},
    {couponcode:query},
    
  ]
    }
    )

    console.log('findSearch offer is ',findsearchedOffers);
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