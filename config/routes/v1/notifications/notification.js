const express = require('express');
const router = express.Router();
const notificationController = require('../../../../controller/notifications/notification')
const AdminVerify = require('../../../../middlewares/adminVerify');

// admin
router.get('/getfcmToken', AdminVerify, notificationController.getfcmToken);
router.get('/get', AdminVerify, notificationController.getNotification);
router.post('/set', AdminVerify, notificationController.setNotification);
router.post('/update', AdminVerify, notificationController.updateNotifications);
router.post('/toggle', AdminVerify , notificationController.toggleNotification);

// user
router.get('/coming', notificationController.comingNotification);

module.exports = router;