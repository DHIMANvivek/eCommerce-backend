const express = require('express');
const router = express.Router();
const AdminVerify=require('../../middlewares/adminVerify');
const { verifyToken } = require('../../helpers/jwt');


router.use('/user', require('./v1/user'));
router.use('/admin', AdminVerify, require('./v1/admin'));
// router.use('/products', require('./v1/products'));
router.use('/orders', require('./v1/orders'));


// Check Type of user (Used for purpose of Authguard)
router.get('/checkUser', (req, res)=>{
    
    const token = req.headers.authorization;
    try{
        if(token){
            const data = verifyToken(token.split(' ')[1]);
            return res.json({role: data.role});
        }
        throw "Token not Found";
    }catch(err){
        return res.status(404).json({messgae: err});
    }
})

router.use(function (req, res) {
    return res.status(404).json({
        success: false,
        error: 'errors.E_NOT_FOUND'
    });
});

module.exports = router;