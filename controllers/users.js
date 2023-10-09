const usersModel = require('../models/users');
const mongoose = require('mongoose');
async function getDetails(req, res) {
    try {
        req.body._id = '651fdc60a055f39416501e50';
        const basicDetails = await usersModel.findById(req.body._id);
        res.status(500).json(basicDetails)
    } catch (error) {
        res.status(500).json(error);
    }
}

async function updateDetails(req, res) {
    try {
        req.body._id = '651fdc60a055f39416501e50';
        const basicDetails = await usersModel.findByIdAndUpdate(req.body._id, req.body, { new: true });
        console.log(basicDetails, "basicccc");
        res.status(500).json(basicDetails)
    } catch (error) {
        console.log(error, "errrorrr");
        res.status(500).json(error);
    }
}


async function getAddress(req, res) {
    try {
        req.body._id = '6517a56ff7a1a1d39676a406';
        const basicDetails = await usersModel.findById(req.body._id, 'info.address');
        res.status(500).json(basicDetails)
    }
    catch (error) {
        res.status(500).json(error);
    }
}


//  PENDING
async function updateAddress(req, res) {
    try {
       const result=await usersModel.findOne(
            { _id:  new mongoose.Types.ObjectId('6513a7af4e2d06d1e0e44660'),
            'info.address[0]': { $elemMatch: { _id: new mongoose.Types.ObjectId('652390e5f04fae193297dffb') } }
       }
        )

       
        // const lasresult=await usersModel.findOneAndUpdate(
        //     { _id: new mongoose.Types.ObjectId('6513a7af4e2d06d1e0e44660'), 'info.address': { $elemMatch: { _id: new mongoose.Types.ObjectId('65238a30b17ee1be93586276') } } }, // Find the user by ID and matching address ID
        //     {
        //       $set: {
        //         'info.address.$': req.body, // Update the matching address
        //       },
        //     },
        //     { new: true } // Return the updated document
        //   )

        res.json(result);
    } catch (error) {
        console.log("error is ", error)
    }
}



async function addAddress(req,res){
    try {
        const addressAdded=await usersModel.findOneAndUpdate(
            { _id:  new mongoose.Types.ObjectId('651fdc60a055f39416501e50')},
           {$push: { 'info.address': req.body}},
           {new:true}
            
        )
    
    if(!addressAdded) throw({message:'Address not updated'})
     res.json(addressAdded);
    } catch (error) {
        res.status(500).json(error)
    }
}


module.exports = {
    getDetails,
    updateDetails,
    getAddress,
    updateAddress,
    addAddress

}