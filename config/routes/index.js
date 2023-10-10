const express = require('express');
const router = express.Router();

router.use('/user', require('./v1/user'));
router.use('/admin', require('./v1/admin'));
router.use('/products', require('./v1/products'));
router.use('/orders', require('./v1/orders'));

router.use(function (req, res) {
    return res.status(404).json({
        success: false,
        error: 'errors.E_NOT_FOUND'
    });
});

module.exports = router;