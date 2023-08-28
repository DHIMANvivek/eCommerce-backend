const express = require('express');
const router = express.Router();

router.use('/api/purchaser', require('./purchaser/index'));
router.use('/api/seller', require('./seller/index'));
const cors = require('cors');
const app= express();
app.use(cors({ origin: 'http://localhost:4200' }));

router.use(function (req, res) {
    return res.status(404).json({
        success: false,
        error: 'errors.E_NOT_FOUND'
    });
});

module.exports = router;
