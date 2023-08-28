'use strict';
const secretKey = "secretKey";
const user = require('../../models/users');
const product = require('../../models/products');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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


}