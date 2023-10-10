const express = require('express')
const router = express.Router();
const authController = require('../../controller/user/authentication');
const JwtVerify = require('../../middlewares/jwtVerify');

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forget', authController.forgotPassword)
router.post('/update', JwtVerify, authController.updatePassword)

module.exports = router;