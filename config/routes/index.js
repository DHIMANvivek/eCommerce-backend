const express = require('express');
const router = express.Router();
const AdminVerify=require('../../middlewares/adminVerify');
const { verifyToken } = require('../../helpers/jwt');


router.use('/user', require('./v1/user'));
router.use('/admin', AdminVerify, require('./v1/admin'));
router.use('/products', require('./v1/products'));
router.use('/orders', require('./v1/orders'));

// Check Type of user (Used for purpose of Authguard)
router.get('/checkUser', (req, res)=>{
    
    const token = req.headers.authorization;
    try{
        if(token){
            const data = verifyToken(token.split(' ')[1]);
            if(data.role!='admin'){
                throw({message:'You are not eligible'})
            }
            return res.json("sucess");
        }
        throw{message: 'Please login or signup first'};
    }catch(error){
        return res.status(404).json(error);
    }
})



router.use(function (req, res) {
    return res.status(404).json({
        success: false,
        error: 'errors.E_NOT_FOUND'
    });
});

module.exports = router;