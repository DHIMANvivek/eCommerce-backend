'use strict';
const secretKey = "secretKey";
const express = require("express");
const app = express();
const user = require('../../models/users');
const product = require('../../models/products');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
    }
}