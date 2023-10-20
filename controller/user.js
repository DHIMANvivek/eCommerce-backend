const Users = require('../models/users');
const Reviews = require('../models/reviews');
const faqData = require('../models/faq');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const address = require('../models/address');
const OffersModel=require('../models/offers');
async function getDetails(req, res) {
    try {
        // req.body._id =req.tokenData._id;
        // console.log('token data is ',req.tokenData);
        const basicDetails = await Users.findById(req.tokenData.id);
        // console.log("baic details ",basicDetails);
        res.status(200).json(basicDetails)
    } catch (error) {
        console.log('ERORR IS ',error);
        res.status(500).json(error);
    }
}

async function updateDetails(req, res) {
    try {
        req.body._id = '6513a7af4e2d06d1e0e44660';
        const basicDetails = await Users.findByIdAndUpdate(req.body._id, req.body, { new: true });
       
        res.status(200).json(basicDetails)
    } catch (error) {
        res.status(500).json(error);
    }
}

async function getAddress(req, res) {
    try {
        // req.body._id = '6513a7af4e2d06d1e0e44660';
        const Addresses = await Users.findById(req.tokenData.id, 'info.address');
        res.status(200).json(Addresses)
    }
    catch (error) {
        res.status(500).json(error);
    }
}

async function addAddress(req, res) {


    try{

        const findUserAddress=await Users.findById(req.tokenData.id,'info.address');

        // info.adddr
        findUserAddress.info.address.push(req.body);
        await findUserAddress.save();
        res.status(200).json(findUserAddress);
    }
    // try {
    //     const addressAdded = await Users.findOneAndUpdate(
    //         { _id: new mongoose.Types.ObjectId('6513a7af4e2d06d1e0e44660') },
    //         { $push: { 'info.address': req.body } },
    //         { new: true }

    //     )


       

    //     if (!addressAdded) throw ({ message: 'Address not updated' })
    //     const lastIndex=addressAdded.info.address.length;
    // console.log("last index is ",lastIndex);
    //     console.log('ADDED ADDRESS IS ',addressAdded.info.address[lastIndex-1]);
    //     res.status(200).json(addressAdded.info.address[lastIndex-1]);
    // } 
    
    
    catch (error) {
        res.status(500).json(error)
    }
}

async function deleteAddress(req, res) {
    try {
        const deletedAddress = await Users.findOneAndUpdate(

            
            { _id: req.tokenData.id },
            { $pull: { 'info.address': { _id: req.body.id } } },
            { new: true }


        )

        res.status(200).json(deleteAddress);
    } catch (error) {
        console.log('error is ',error);
        res.status(500).json(error);
    }
}

async function updateAddress(req, res) {
    try {

        // const findUserAddress=await Users.findOne(new mongoose.Types.ObjectId("6513a7af4e2d06d1e0e44660"),'info.address');
        //     findUserAddress.info.address[0].firstname='New name given';
        // await findUserAddress.save();

        // const findUserAddress=await Users.findOne(new mongoose.Types.ObjectId("6513a7af4e2d06d1e0e44660"),'info.address');
        // const findUserAddress=await Users.findOne(new mongoose.Types.ObjectId("6513a7af4e2d06d1e0e44660"),'info.address');
        //     findUserAddress.info.address[0].firstname='New name given';
        // await findUserAddress.save();
        res.status(200).json(findUserAddress);
        
        // const updateParticularAddress = await Users.updateOne({ _id: new mongoose.Types.ObjectId("6513a7af4e2d06d1e0e44660") }, { $set: { email: 'Abhishekl23@gmail.com' } })
        // res.status(200).json(updateParticularAddress)
    } catch (error) {
        console.log('error is ',error);
        res.status(500).json(error)
    }
}
async function createPaymentIntent(req, res) {
    try {
        // parseFloat(items[0].price * 100)
        const { items } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 12,
            currency: "inr",
            description: JSON.stringify(items),
            metadata: {
                items: JSON.stringify(items),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
    
        res.json({ clientSecret: paymentIntent.client_secret, description: paymentIntent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
    }
}

async function getOrders(req, res) {
    try {
        const userOrders = await ordersModel.findOne({ buyerId: req.body._id });
        res.status(200).json(userOrders);
    } catch (error) {
        if (error.message) {
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }
}


// incomplete
async function addReview(req, res){
    try {
        let input = req.body;
        console.log(req.body);

        await Reviews.insertOne(input);
    } catch (error) {
        if (error.message) {
            res.status(500).json(error);
            return;
        }
        res.status(500).json(error);
    }
}

async function putReviews(req, res){
    console.log(req.body);
    Reviews.insertMany(req.body);
}


async function GetCoupons(req,res){

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
        console.log(err);
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
    addAddress,
    deleteAddress,
    updateAddress,
    createPaymentIntent,
    getOrders,
    addReview,
    putReviews,
    getFaq,
    sendData
}