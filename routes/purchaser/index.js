const express = require('express');
const router = express.Router();
const userController = require('../../controller/user/user');

// explain the methods -> go to controller\user\user.js

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get("/getUser", userController.getUser);
router.get("/getProduct", userController.getProduct);


module.exports = router;