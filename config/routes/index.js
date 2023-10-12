const express = require('express');
const router = express.Router();
const AdminVerify=require('../../middlewares/adminVerify');
router.use('/user', require('./v1/user'));
router.use('/admin',AdminVerify, require('./v1/admin'));
// router.use('/products', require('./v1/products'));
router.use('/orders', require('./v1/orders'));

router.use(function (req, res) {
    return res.status(404).json({
        success: false,
        error: 'errors.E_NOT_FOUND'
    });
});

module.exports = router;