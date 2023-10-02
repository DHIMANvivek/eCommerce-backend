'use strict';
const secretKey = "secretKey";
const express = require("express");
const app = express();
const user = require('../../models/users');
const product = require('../../models/products');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const stripe = require("stripe")('sk_test_51NvsyeSENcdZfgNiy559a6dtaofzqfn00MVNCrPe4kQWAZNZulhdDmJePJTZvSSzzu4xnkTjHIjmWPVdzTW1L6oc00oI29MAG4');

app.use(express.static("public"));
module.exports = {

    signup: async (req, res) => {
        // const { username, email, password } = req.body;

        // try {
        //     const existingUser = await user.findOne({ name: username });

        //     if (existingUser) {
        //         return res.status(400).json({ error: 'Username already exists' });
        //     }

        //     const hashedPassword = await bcrypt.hash(password, 10);
        //     const newUser = new user({
        //         _id: new mongoose.Types.ObjectId(),
        //         name: username,
        //         email: email,
        //         password: hashedPassword
        //     });

        //     const result = await newUser.save();

        //     jwt.sign({ data: result }, secretKey, { expiresIn: '10s' }, (err, token) => {
        //         if (!err) {
        //             res.json({ token });
        //         } else {
        //             res.status(500).json({ error: 'Error generating token' });
        //         }
        //     });
        // } catch (err) {
        //     res.status(500).json({ error: 'Error saving user data' });
        // }
    },

    login: async (req, res) => {
        // const username = req.body.username;
        // const password = req.body.password;

        // try {
        //     const foundUser = await user.findOne({ role: 'PURCHASER', name: username });

        //     if (foundUser) {
        //         const passwordMatch = await bcrypt.compare(password, foundUser.password);

        //         if (passwordMatch) {
        //             jwt.sign({ result: foundUser }, secretKey, { expiresIn: '300s' }, (err, token) => {
        //                 if (!err) {
        //                     res.json({ token });
        //                 } else {
        //                     res.status(500).json({ error: 'Error generating token' });
        //                 }
        //             });
        //         } else {
        //             res.status(401).json({ error: 'Invalid credentials' });
        //         }
        //     }
        //     else {
        //         res.status(404).json({ error: 'User not found' });
        //     }
        // } catch (err) {
        //     res.status(500).json({ error: 'Error finding user' });
        // }
    },

    getUser: async (req, res) => {
        // try {
        //     let users = await user.find();
        //     return res.status(200).send({
        //         success: true,
        //         data: users
        //     });
        // } catch (error) {
        //     console.log(error)
        // }
    },

    getProduct: async (req, res) => {
        // try {
        //     let products = await product.find();
        //     return res.status(200).send({
        //         success: true,
        //         data: products
        //     });
        // } catch (error) {
        //     console.log(error)
        // }
    },
    // createPaymentIntent: async (req, res) => {
    //     const { items } = req.body;
    //     const itemsString = JSON.stringify(items);
    //     const descriptionString = itemsString;
    //     const descriptionArray = JSON.parse(descriptionString);
    //     //  const description = descriptionArray.map((item) => {
    //     //       return item.name;
    //     //  });
    //     console.log(descriptionArray[0].name);
    //     // Create a PaymentIntent with the order amount and currency
    //     const paymentIntent = await stripe.paymentIntents.create({
    //         amount: 20,
    //         currency: "inr",
    //         description: JSON.stringify(descriptionArray),
    //         metadata: {
    //             items: JSON.stringify(descriptionArray),
    //         },
    //         automatic_payment_methods: {
    //             enabled: true,
    //         },
    //     });
    //     console.log(JSON.parse(paymentIntent.description)[0].id, "paymentIntent")

    //     res.send({
    //         clientSecret: paymentIntent.client_secret,
    //     });
    // }

}