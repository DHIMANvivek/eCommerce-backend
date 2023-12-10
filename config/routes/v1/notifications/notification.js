const express = require('express');
const router = express.Router();
const notificationController = require('../../../../controller/notifications/notification')
const AdminVerify = require('../../../../middlewares/adminVerify');
const jwtVerify = require('../../../../middlewares/jwtVerify');

// admin
router.get('/getfcmToken', AdminVerify, notificationController.getfcmToken);
router.get('/userFcmtoken', jwtVerify, notificationController.userFcmtoken);
router.get('/get', AdminVerify, notificationController.getNotification);
router.post('/set', AdminVerify, notificationController.setNotification);
router.post('/update', AdminVerify, notificationController.updateNotifications);
router.post('/toggle', AdminVerify , notificationController.toggleNotification);
router.post('/send', AdminVerify, notificationController.sendNotification);
router.post('/delete', AdminVerify, notificationController.deleteNotification);
router.get('/notification', notificationController.notificationSocket);
// user
router.get('/coming', notificationController.comingNotification);

module.exports = router;