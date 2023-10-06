const express = require('express')
const router = express.Router();
const authController = require('../../../controllers/authentication')

console.log('authController is ',authController);

router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/forget',authController.forgotPassword)
module.exports = router;