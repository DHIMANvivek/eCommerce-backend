const express = require('express');
const router = express.Router();

router.use('/api/purchaser', require('./purchaser/index'));
router.use('/api/purchaser', require('./purchaser/authentication'))
router.use('/api/purchaser', require('./purchaser/dashboard'))
router.use('/api/purchaser', require('./purchaser/orders'))
router.use('/api/purchaser', require('./purchaser/users'))
// router.use('/api/seller', require('./seller/index'));

router.use(function (req, res) {
    return res.status(404).json({
        success: false,
        error: 'errors.E_NOT_FOUND'
    });
});

module.exports = router;
