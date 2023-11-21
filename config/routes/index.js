const express = require('express');
const router = express.Router();
const AdminVerify = require('../../middlewares/adminVerify');
const { verifyToken } = require('../../helpers/jwt');
const mailer = require('../../helpers/nodemailer');
const { SubscribeTemplate } = require('../../helpers/INDEX');
const { TicketStatusTemplate } = require('../../helpers/INDEX');
const jwtVerify = require('../../middlewares/jwtVerify')
const { sendInvoiceTemplate } = require('../../helpers/INDEX');
const redisClient = require('./../../config/redisClient');
const paginateResults = require('../../helpers/pagination');
const Notification = require('../../models/notifications/notifications')
const axios = require('axios');
const notifications = require('../../models/notifications/notifications');
router.use('/user', require('./v1/user'));
router.use('/admin', AdminVerify, require('./v1/admin'));
router.use('/products', require('./v1/products'));
router.use('/reviews', require('./v1/reviews'));
router.use('/orders', require('./v1/orders'))
router.use('/cart', require('./v1/cart'));
router.use('/offer', require('./v1/offer'));
router.use('/wishlist', jwtVerify, require('./v1/wishlist'));
router.use('/socials', require('./v1/custom-website-elements/socials'));
router.use('/faqs', require('./v1/custom-website-elements/faqs'));
router.use('/paymentkeys', require('./v1/custom-website-elements/paymentKeys'));
// router.use('/payIntent', require('./v1/stripe/stripe'));
router.use('/banners', require('./v1/custom-website-elements/banners'))
router.use('/sales', require('./v1/custom-website-elements/sales'))

router.use('/deals', require('./v1/custom-website-elements/deals'))
router.use('/about',require('./v1/custom-website-elements/about'))
router.use('/razorpay', require('./v1/razorpay/payment'));

router.use('/deals', require('./v1/custom-website-elements/deals'));
router.use('/homeLayout', require('./v1/custom-website-elements/home-layout'));
// tickets
router.use('/ticket', require('./v1/support-ticket/ticket'));

// notification
router.use('/notification', require('./v1/notifications/notification'));



// check type of user (Used for purpose of Authguard)
router.get('/checkUser', (req, res) => {

    const token = req.headers.authorization;
    try {
        if (token) {
            const data = verifyToken(token.split(' ')[1]);
            if (data.role != 'admin') {
                throw ({ message: 'You are not an admin.' })
            }
            return res.json("sucess");
        }
        throw { message: 'Please login/signup first.' };
    } catch (error) {
        return res.status(404).json(error);
    }
})

//send subscribe mail 
router.post('/sendMail', async (req, res) => {
    const mailData = {
        email: req.body.email,
        subject: "Thank You for Subscribing - Enjoy 25% Off!"
    }
    const mailSent = await mailer(mailData, SubscribeTemplate);

    res.status(200).json({
        message: "done"
    })

})

// payment intent
router.post('/create-payment-intent', async (req, res) => {

    const response = await fetch('http://localhost:1000/paymentKeys/get');

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const privateKey = data[0].keys[0].privateKey;

    const stripe = require('stripe')(privateKey);

    try {
        const { items } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(items[0].price * 100),
            currency: "inr",
            description: JSON.stringify(items),
            metadata: {
                items: JSON.stringify(items),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

          redisClient.set('payment_intent_client_secret', paymentIntent.client_secret, 'EX', 3600, (err, reply) => {
            if (err) {
              console.error('Error storing client secret:', err);
            } else {
              console.log('Client secret stored in Redis');
            }
          });

        res.json({ clientSecret: paymentIntent.client_secret, description: paymentIntent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
    }
})

// getPaginated Data
router.get('/getPaginatedData/:model', getPaginatedData);

async function getPaginatedData(req, res) {
    const modelName = req.params.model;
    const page = parseInt(req.query.page, 1) || 1;
    const pageSize = parseInt(req.query.pageSize, 3) || 10;

    try {
        const Model = require(`../../models/custom-website-elements/${modelName}`);
        const data = await paginateResults(Model, page, pageSize);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// ticket status
router.post('/ticketStatus', async (req, res) => {
try {
    const mailData = {
        email: req.body.email,
        subject: "Ticket Status",
        status: req.body.status,
        message: req.body.message
    }
    const emailTemplate = TicketStatusTemplate(mailData);
    const mailSent = await mailer(mailData, emailTemplate);

    res.status(200).json({
        message: "done"
    })
} catch (error) {
    console.log(error , "error is ")
}
})

// email invoice 

router.post('/invoiceSend', async (req, res) => {
    const mailData = {
        email: req.body.receipt_email,
        subject: "Invoice",
        invoice: req.body
    }
    const emailTemplate = sendInvoiceTemplate(mailData.invoice);
    await mailer(mailData, emailTemplate);

    res.status(200).json({
        message: "done"
    })
})

router.use(function (req, res) {
    return res.status(404).json({
        success: false,
        error: 'errors.E_NOT_FOUND'
    });
});

module.exports = router;