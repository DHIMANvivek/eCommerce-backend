const Users = require('../models/users');
const Reviews = require('../models/reviews');
const faqData = require('../models/faq');

// const Title = require('../models/createTicket');
// const Ticket = require('../models/supportTicket');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const address = require('../models/address');
const OffersModel = require('../models/offers');
// const OffersModel=require('../models/offers');
const paginateResults = require('../helpers/pagination');
const ProductController=require('../controller/products');
async function getDetails(req, res) {

    try {
        const basicDetails = await Users.findById(req.tokenData.id);
        res.status(200).json(basicDetails)
    } catch (error) {
        res.status(500).json(error);
    }
}

async function updateDetails(req, res) {
    try {
        const basicDetails = await Users.findByIdAndUpdate(req.tokenData.id, req.body, { new: true });
        console.log('details is ',basicDetails);
        res.status(200).json(basicDetails)
    } catch (error) {
        console.log('error is ',error);
        res.status(500).json(error);
    }
}

async function getAddress(req, res) {
    try {
        const Addresses = await Users.findById({_id:req.tokenData.id,'info.address.status':true}, 'info.address');
        // console.log('Adress isb ',Addresses);
        res.status(200).json(Addresses)
    }
    catch (error) {
        res.status(500).json(error);
    }
}

async function getPaginatedData(req, res) {
    const modelName = req.params.model; 
    const page = parseInt(req.query.page, 1) || 1;
    const pageSize = parseInt(req.query.pageSize, 3) || 10;

    try {
      const Model = require(`../models/${modelName}`); 
      const data = await paginateResults(Model, page, pageSize);

      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

async function addAddress(req, res) {
    try {
        const findUserAddress = await Users.findOne({_id:req.tokenData.id});
        if(findUserAddress.info.address.length==0)
        {
            req.body.defaultAddress=true;
        }
        findUserAddress.info.address.push(req.body);
        await findUserAddress.save();
        res.status(200).json(req.body);
    }
    catch (error) {
        // if (error.name == 'ValidationError') {
        //     res.status(400).json({ error: 'Validation error', message: error.message });
        //     return;
        // }
        res.status(500).json(error)
    }
}

async function deleteAddress(req, res) {
    try {

        // projection:{'info.address':1}

        const updatedValue = await Users.updateOne({
            _id: req.tokenData.id,
            'info.address._id': address_id
        },{
            $set: {
                'info.address.status.$': false
            }
        },
        { projection:{'info.address':1}});
        // if(deleteAddress)
        console.log('deleted Address is ',updatedValue);
        res.status(200).json(updatedValue);
    } catch (error) {
        console.log('errpr is ',error);
        res.status(500).json(error);
    }
}

async function updateAddress(req, res) {
    try {
        const address_id = req.body._id;
        const updatedValue = await Users.updateOne({
            _id: req.tokenData.id,
            'info.address._id': address_id
        },{
            $set: {
                'info.address.$': req.body
            }
        });
        res.status(200).json(req.body);
    } catch (error) {
        res.status(500).json(error)
    }
}

async function DefaultAddress(req,res){
    try {
        await Users.updateMany({
            _id: req.tokenData.id,
        },{
            $set: {
                'info.address.$[].defaultAddress': false
            }
        });
        const updatedValue= await Users.updateOne({
            _id: req.tokenData.id,
            'info.address._id': req.body.address_id
        },{
            $set: {
                'info.address.$.defaultAddress': true
            }
        });

        const FindAllAddress=await Users.find({
            _id:req.tokenData.id,

        },{'info.address':1,_id:0})
        console.log('updateAddress is ',updatedValue);
        res.status(200).json(FindAllAddress)
    } catch (error) {
        console.log('error coming is ',error);
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
        // const userOrders = await ordersModel.findOne({ buyerId: req.body._id });
        // const 
        // const Products=await ProductController.get

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
async function addReview(req, res) {
    try {
        const getAllCoupons = await OffersModel.find({ $and: [{ OfferType: 'coupon' }, { userUsed: { $nin: [req.body.id] } }] });
        res.status(200).json(getAllCoupons);

    }
    catch (error) {
        res.status(500).json(error);
    }
}

async function putReviews(req, res) {
    console.log(req.body);
    Reviews.insertMany(req.body);
}


async function getCoupons(req, res) {
    try {
        const getAllCoupons = await OffersModel.find({ $and: [{ OfferType: 'coupon' }, { userUsed: { $nin: [req.tokenData.id] } },{startDate:{$lte:(new Date())}},{"status.active":false},{"status.deleted":false}], });
        res.status(200).json(getAllCoupons);

    } catch (error) {
        res.status(500).json(error);
    }
}

async function usedCoupon(req, res) {
    try {
        req.body.id = new mongoose.Types.ObjectId('6513a7af4e2d06d1e0e44660');
        req.body.couponId = new mongoose.Types.ObjectId('65312dcde94dc6738db7bb21');
        const findCoupon = await OffersModel.findById(req.body.couponId);


        findCoupon.userUsed.push(req.body.id);
        await findCoupon.save();
        res.status(200).json(findCoupon);
    } catch (error) {
        console.log('error is ', error);
        res.status(500).json(error);
    }
}


async function getFaq(req, res) {
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

// async function getTicketTitle(req, res) {
//     try {
//         const response = await Title.find({});
//         if (response) {
//             return res.status(200).json(response);
//         }
//         throw "404";
//     } catch (err) {
//         console.log(err);
//         return res.status(404).send();
//     }
//   }

// async function sendTicket(req , res) {
//     console.log(req.body)
//     try {
//         const ticketType = await Title.findOne({ title: req.body.selectedTicket});
    
//         if (!ticketType) {
//           return res.status(404).json({ error: 'TicketType not found' });
//         }
    
//         const newTicket = new Ticket({
//           userName: req.body.name,
//           userEmail: req.body.email,
//         //   status: '',
//         //   action: '',
//           ticketTypes: req.body.selectedTicket,
//           message: req.body.message,
//           ticketType: {title: ticketType},
//         });
    
//         const savedTicket = await newTicket.save();
    
//         return res.status(200).json(savedTicket);
//       } catch (error) {
//         console.error('Error creating ticket:', error);
//         return res.status(500).json({ error: 'An error occurred while creating the ticket' });
//       }
// }


module.exports = {
    getDetails,
    updateDetails,
    getAddress,
    getCoupons,
    DefaultAddress,
    usedCoupon,
    getCoupons,
    addAddress,
    deleteAddress,
    updateAddress,
    createPaymentIntent,
    getOrders,
    getFaq,
    sendData,
    getCoupons,
    getPaginatedData,
    // getTicketTitle,
    // sendTicket
}