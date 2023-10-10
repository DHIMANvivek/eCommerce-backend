const express = require('express')
const router = express.Router();
const userController = require('../../controller/user/users')

router.get('/getDetails',userController.getDetails)
router.post('/updateDetails',userController.updateDetails)
router.get('/getAddress',userController.getAddress)
router.post('/updateAddress',userController.updateAddress)
router.post('/addAddress',userController.addAddress)
module.exports = router;