const usersModel = require('../models/users');

async function getDetails(req,res){
    try {
        req.body._id='6517a56ff7a1a1d39676a406';
        const basicDetails=await usersModel.findById(req.body._id);
        res.status(500).json(basicDetails)
    } catch (error) {
        if(error.message){
            res.status(500).json(error);
            return;
        }
        res.status(500).json(error);
    }
}

async function updateDetails(req,res){
    try {
        req.body._id='6522209865ffad571dae84d4';
        const basicDetails=await usersModel.findByIdAndUpdate(req.body._id,req.body,{new:true});
        res.status(500).json(basicDetails)
    } catch (error) {
        if(error.message){
            res.status(500).json(error);
            return;
        }
        res.status(500).json(error);
    }
}


async function getAddress(req,res){
    try {
        req.body._id='6517a56ff7a1a1d39676a406';
        const basicDetails=await usersModel.findById(req.body._id,'info.address');
        res.status(500).json(basicDetails)
    } 
    catch (error) {
        if(error.message){
            res.status(500).json(error);
            return;
        }
        res.status(500).json(error);
    }
}


module.exports={
    getDetails,
    updateDetails,
    getAddress
}