const users = require('../models/users');
const products = require('../models/products');


async function addProduct(req, res) {
    console.log(req.body);
    const productObject = req.body[0];
    console.log(productObject.data, "data");
    try {
        if (productObject.type == 'bulk') {
            const response = await products.insertMany(productObject.data);
        } else {
            const response = await products.insertOne(productObject.data);
        }
    } catch (err) {

    }
}

async function featureProductDetails(req, res) {
    const email = req.headers.email;

    try {
        const response = await users.findOne({ 'email': email });
        if (response) {
            const product = await products.find({ sellerID: `response._id` });
            console.log(product);
            res.send(product);
        } else {
            throw "404"
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    addProduct,
    featureProductDetails
}