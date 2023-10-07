const express = require("express");
const router = express.Router();
const UserModel = require('../models/users');
const OrdersModel = require('../models/order')
const Products = require('../models/products')
async function GetParticularUser(req, res) {

    try {
        // req.body.email="abhishek@gmail.com";
        const userPresent = await UserModel.findOne({ $or: [{ email: req.body.email }, { _id: req.body._id }] })
        res.json(userPresent);
    } catch (error) {
        res.json({ error: error });
    }


}

async function GetParticularUserOrder(req, res) {
    try {

        const userPresent = await UserModel.findOne({ $or: [{ email: req.body.email }, { _id: req.body._id }] })
        const userOrders = await OrdersModel.find({ buyerId: userPresent._id }).populate({ path: 'product.productId', select: 'name sku description assets' });

        res.json(userOrders);
    } catch (error) {
        console.log('error is ', error);
        res.json({ error: error });
    }

}


// CREATE ACCOUNT
async function Register(req, res) {
    try {


        const user = await UserModel.findOne({ email: req.body.email });
        if (user) {
            throw ('User Already Present');
        }


        const newUser = UserModel.create(req.body);
        res.json(newUser);

    } catch (error) {
        res.json(error);
    }

}


async function AddAddress(req, res) {
    try {

        console.log('bodu os ', req.body);


        const useraddress = await UserModel.updateOne({ $or: [{ email: req.body.email }, { _id: req.body._id }] }, { $push: { 'info.address': req.body } });


        res.json(useraddress);
    } catch (error) {
        console.log('error is ', error);
        res.json({ error: error });
    }
}


async function EditAddress(req, res) {
    try {
        console.log("Edit Address clicked")
        const newAddress = await UserModel.findOne({ 
            '_id': req.body._id , 
            'info.address': { 
                $elemMatch: { _id: req.body.id } 
            } 
        }, 
        {'info.address.$': 1 });

        // const newAddress = await UserModel.aggregate([
        //     { $match: { '_id': req.body._id } },
        //     { $unwind: '$info.address' },
        //     { $match: { 'info.address._id': req.body.id } },
        //     {
        //         $group: {
        //             _id: '$email', 'address': {
        //                 $first: '$info.address'
        //             }
        //         }
        //     }
        // ]);


        // $group: {
        //     _id: '$users.email', 'address': {
        //         $first: '$users.info.address'
        //     }
        // }
        // $match: {'info.address._id': req.body.id},



        res.json(newAddress)
    } catch (error) {
        console.log("error ocucred ", error);
        res.json(error)
    }
}

router.post('/user', GetParticularUser);
router.post('/orders', GetParticularUserOrder);
router.post('/create', Register);
router.post('/address', AddAddress);
router.post('/EditAddress', EditAddress);
module.exports = router;