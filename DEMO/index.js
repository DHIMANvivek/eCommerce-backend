const express = require("express");
const router = express.Router();
const UserModel=require('../models/users');
const OrdersModel=require('../models/order')
const Products=require('../models/products')
async function GetParticularUser(req,res){

    try {
        // req.body.email="abhishek@gmail.com";
        const userPresent=await UserModel.findOne({$or:[{email:req.body.email},{_id:req.body._id} ]})
 res.json(userPresent);
    } catch (error) {
            res.json({error:error});
    }
   

}

async function GetParticularUserOrder(req,res){
    try {
       
        const userPresent=await UserModel.findOne({$or:[{email:req.body.email},{_id:req.body._id} ]})
        const userOrders=await OrdersModel.find({buyerId:userPresent._id}).populate({path:'product.productId', select:'name sku description assets' });
        
 res.json(userOrders);
    } catch (error) {   
        console.log('error is ',error);
            res.json({error:error});
    }
   
}


// CREATE ACCOUNT
async function Register(req,res){
    try {
        
        console.log('BODY IS ',req.body);
        const user=await UserModel.findOne({email:req.body.email});
        if(user){
            throw ('User Already Present');
        }


        const newUser= UserModel.create(req.body);
        res.json(newUser);

    } catch (error) {
        res.json(error);
    }
  
}


async function AddAddress(req,res){
    try {

        console.log('bodu os ',req.body);
        

        const useraddress=await UserModel.updateOne({$or:[{email:req.body.email},{_id:req.body._id} ]}, {$push: {'info.address':req.body}});
        
       
 res.json(useraddress);
    } catch (error) {   
        console.log('error is ',error);
            res.json({error:error});
    }
}

router.post('/user',GetParticularUser);
router.post('/orders',GetParticularUserOrder);
router.post('/create',Register);
router.post('/address',AddAddress);
module.exports=router;