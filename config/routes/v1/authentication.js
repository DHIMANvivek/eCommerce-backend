const express = require('express')
const router = express.Router();
const authController = require('../../../controllers/authentication')

console.log('authController is ',authController);

router.post('/signup',authController.Signup)

router.post('/login',authController.Login)


module.exports = router;