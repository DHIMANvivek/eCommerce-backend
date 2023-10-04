const express = require('express')
const router = express.Router();

console.log("You are in config/routes");

router.use('/', require('../routes/v1/authentication'))

module.exports = router