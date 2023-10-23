const express = require('express');
const router = express.Router();
const AdminVerify=require('../../middlewares/adminVerify');
const { verifyToken } = require('../../helpers/jwt'); 
const mailer = require('../../helpers/nodemailer');
const { SubscribeTemplate } = require('../../helpers/INDEX');

router.use('/user', require('./v1/user'));
router.use('/admin', AdminVerify, require('./v1/admin'));
router.use('/products', require('./v1/products'));
router.use('/orders', require('./v1/orders'));
router.use('/cart', require('./v1/cart'));
router.use('/wishlist', require('./v1/wishlist'))


// check type of user (Used for purpose of Authguard)
router.get('/checkUser', (req, res)=>{
    
    const token = req.headers.authorization;
    try{
        if(token){
            const data = verifyToken(token.split(' ')[1]);
            if(data.role!='admin'){
                throw({message:'You are not an admin.'})
            }
            return res.json("sucess");
        }
        throw{message: 'Please login/signup first.'};
    }catch(error){
        return res.status(404).json(error);
    }
})

//send subscribe mail 
router.post('/sendMail', async (req, res)=>{
    const mailData = {
        email : req.body.email,
        subject : "Thank You for Subscribing - Enjoy 25% Off!"
    }
    const mailSent = await mailer(mailData, SubscribeTemplate);

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