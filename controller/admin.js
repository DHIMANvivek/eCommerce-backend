const users = require('../models/users');
const products = require('../models/products');
const sellerInfo = require('../models/sellerDetails');


async function addProduct(req, res) {
    const productObject = req.body[0];

    try {
        if (productObject.type == 'bulk') {
            const response = await products.insertMany(productObject.data);
        } else {
            const response = await products.insertOne(productObject.data);
        }
    } catch (err) {

    }
}

async function fetchProducts(req, res) {
    const sellerID = req.headers.sellerid;

    try {
        console.log(sellerID);
        const response = await products.find(
            { 'sellerID': sellerID },
            {
                'sku': 1,
                "name": 1,
                "assets.stockQuantity": 1,
                "assets.photo": 1,
                'price': 1,
                'info.category': 1,
                'info.brand': 1
            }
        );

        res.json(response);
    } catch (err) {

    }
}

async function fetchProductDetails(req, res) {
    const sellerID = req.tokenData.id;
    
    try {
        const response = await sellerInfo.findOne(
            {
                'sellerID': sellerID
            },
            {
                categories: 1,
                brands: 1,
                sizes: 1,
                tags: 1,
                orderQuantity: 1
            });
        
        if (response) {
            return res.status(200).json(response);
        }
        throw "404";
    } catch (err) {
        console.log(err);
        return res.status(404).send();
    }
}

async function updateProductDetails(req, res) {
    const sellerID = req.headers.sellerid;
    const field = req.body.field;
    const data = req.body.data;

    try {
        const response = await sellerInfo.updateOne({ 'sellerID': sellerID }, { $set: { [field]: data } });
        if (response) {
            return res.status(200).json(response);
        }
        throw "404";
    } catch (err) {
        console.log(err);
        return res.status(404).send();
    }
}

module.exports = {
    addProduct,
    fetchProducts,
    fetchProductDetails,
    updateProductDetails
}