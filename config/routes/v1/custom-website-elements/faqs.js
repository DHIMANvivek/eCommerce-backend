const express = require('express');
const router = express.Router();
const faqsController = require('./../../../../controller/custom-website-elements/faqs');
const AdminVerify = require('../../../../middlewares/adminVerify');

router.get('/get', faqsController.getFaq);
router.post('/delete', AdminVerify , faqsController.deleteFaq);
router.post('/update', AdminVerify , faqsController.updateFaq);
router.post('/add', AdminVerify , faqsController.addFaq);

module.exports = router;