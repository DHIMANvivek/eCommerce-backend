'use strict';
const secretKey = "secretKey";
const express = require("express");
const app = express();
const UserModel = require('../../models/users');
const product = require('../../models/products');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { get } = require("../../models/address");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(express.static("public"));
module.exports = {

    createPaymentIntent: async (req, res) => {
        try {
            const { items } = req.body;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: parseFloat(items[0].price * 100),
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
    },

    GetParticularUser: async (req, res) => {
        try {
            // req.body.email="abhishek@gmail.com";
            const userPresent = await UserModel.findOne({ $or: [{ email: req.body.email }, { _id: req.body._id }] })
            res.json(userPresent);
        } catch (error) {
            res.json({ error: error });
        }
    },

    GetParticularUserOrder: async (req, res) => {
        try {

            const userPresent = await UserModel.findOne({ $or: [{ email: req.body.email }, { _id: req.body._id }] })
            const userOrders = await OrdersModel.find({ buyerId: userPresent._id }).populate({ path: 'product.productId', select: 'name sku description assets' });

            res.json(userOrders);
        } catch (error) {
            console.log('error is ', error);
            res.json({ error: error });
        }
    },

    AddAddress: async (req, res) => {
        try {

            console.log('bodu os ', req.body);


            const useraddress = await UserModel.updateOne({ $or: [{ email: req.body.email }, { _id: req.body._id }] }, { $push: { 'info.address': req.body } });


            res.json(useraddress);
        } catch (error) {
            console.log('error is ', error);
            res.json({ error: error });
        }
    },

    EditAddress: async (req, res) => {
        try {
            console.log("Edit Address clicked")
            const newAddress = await UserModel.findOne({
                '_id': req.body._id,
                'info.address': {
                    $elemMatch: { _id: req.body.id }
                }
            },
                { 'info.address.$': 1 });

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
    },
  
   getOrders: async(req,res)=>{
    try {
        const userOrders=await ordersModel.findOne({buyerId:req.body._id});
        res.status(200).json(userOrders);
    } catch (error) {
        if(error.message){
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }
},

}