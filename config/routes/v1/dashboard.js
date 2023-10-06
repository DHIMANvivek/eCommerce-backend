const express = require('express')
const router = express.Router();
const authController = require('../../../controllers/authentication')
const middleware=require('../../../middlewares/jwtVerify');

console.log('authController is ',authController);

router.post('/dashboard',middleware,authController.signup)
router.post('/login',authController.login)

module.exports = router;