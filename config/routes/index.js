const express = require('express');
const router = express.Router();
const AdminVerify = require('../../middlewares/adminVerify');
const { verifyToken } = require('../../helpers/jwt');
const mailer = require('../../helpers/nodemailer');
const { SubscribeTemplate } = require('../../helpers/INDEX');
const { TicketStatusTemplate } = require('../../helpers/INDEX');
const jwtVerify = require('../../middlewares/jwtVerify')
const { sendInvoiceTemplate } = require('../../helpers/INDEX');


router.use('/user', require('./v1/user'));
router.use('/admin', AdminVerify, require('./v1/admin'));
router.use('/products', require('./v1/products'));
router.use('/reviews', require('./v1/reviews'));
router.use('/orders', require('./v1/orders'));
router.use('/cart', require('./v1/cart'));
router.use('/offer',require('./v1/offer'));
router.use('/wishlist', jwtVerify, require('./v1/wishlist'))
router.use('/socials', require('./v1/custom-website-elements/socials'));

const PaymentKeys = require('../../models/paymentKeys');
const paginateResults = require('../../helpers/pagination');

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
router.post('/create-payment-intent', async (req, res)=>{
    
    const response = await fetch('http://localhost:1000/getPaymentKeys');

    if (!response.ok) {
        throw new Error('Network response was not ok');
      }

    const data = await response.json();
    const privateKey = data[0].keys[0].privateKey;

    const stripe = require('stripe')(privateKey);

    console.log(req.body, "payment intent")
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

        res.json({ clientSecret: paymentIntent.client_secret, description: paymentIntent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
    }
})

// payment keys
router.get('/getPaymentKeys', async (req, res)=>{
    try {
        const paymentKeys = await PaymentKeys.aggregate([
          {
            $unwind: "$keys" 
          },
          {
            $match: {
              "keys.enable": true 
            }
          },
          {
            $lookup: {
              from: "users", 
              localField: "keys.adminId",
              foreignField: "_id",
              as: "keys.admin" 
            }
          },
          {
            $group: {
              _id: "$_id",
              keys: { $push: "$keys" } 
            }
          }
        ]);
    
        res.status(200).json(paymentKeys);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json(error);
      }
})

// getPaginated Data
router.get('/getPaginatedData/:model', getPaginatedData);

async function getPaginatedData(req, res) {
    const modelName = req.params.model; 
    const page = parseInt(req.query.page, 1) || 1;
    const pageSize = parseInt(req.query.pageSize, 3) || 10;

    try {
      const Model = require(`../../models/${modelName}`); 
      const data = await paginateResults(Model, page, pageSize);

      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

// ticket status
router.post('/ticketStatus', async (req, res) => {
    console.log(req.body)
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

})

// email invoice 
router.post('/invoiceSend', async (req, res)=>{
  console.log(req.body)
    const mailData = {
        email : req.body.receipt_email,
        subject : "Invoice",
        invoice: req.body
    }
    const emailTemplate = sendInvoiceTemplate(mailData.invoice);
    const mailSent = await mailer(mailData, emailTemplate);

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