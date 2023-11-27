const aboutModel = require('../../models/custom-website-elements/about');
const adminController = require('../../controller/admin');
const orderController = require('../../controller/orders');
const logger = require('./../../logger');

async function updateAboutPage(req, res) {
    try {
        const updateDealsPage = await aboutModel.updateOne({}, { $set: req.body });
        const Details = await aboutModel.findOne({});
        res.status(200).json(Details);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function getAboutPageDetails(req, res) {
    try {
        const Details = await aboutModel.findOne({});
        res.status(200).json(Details);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function getOverallStatus(req, res) {
    try {
        const overStats = await adminController.getOverallInfo(req, res, true);
        const orderStats = await orderController.getSellerOrdersInventory(req, res, true);

        console.log(overStats, ' ', orderStats);
    }
    catch (err) {
        logger.error(err);
    }
}

module.exports = {
    updateAboutPage,
    getAboutPageDetails,
    getOverallStatus
}