const users = require('../models/users');
const products = require('../models/products');
const sellerInfo = require('../models/sellerDetails');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


async function addProduct(req, res) {
    const sellerID = req.tokenData.id;
    const productObject = req.body;

    try {
        if (productObject.type == 'bulk') {
            const response = await products.insertMany(productObject.data);
        } else {

            // const data = dataTranformation(productObject.data, sellerID);

            Object.keys(productObject.data.basicinfo).forEach((key) => {
                productObject.data[key] = productObject.data.basicinfo[key];
            });
            productObject.data.sellerID = sellerID;
            productObject.data.sku = "sku-kurta001";
            console.log(productObject.data);
            delete productObject.data.basicinfo;
            const response = await products.create(productObject.data);
            return res.status(200).json("uploaded");
        }
    } catch (err) {
        console.log(err);
    }
}

async function fetchProducts(req, res) {
    const sellerID = req.tokenData.id;
    const parameters = req.body;
    try {
        const categories = await sellerInfo.find({ 'sellerID': sellerID }, { 'categories': 1 });
        const response = await products.aggregate([
            { $match: { 'sellerID': new ObjectId(sellerID) } },
            { $skip: (parameters.page - 1) * parameters.limit },
            { $limit: parameters.limit },
            // { $match: {$or: [{'info.category': parameters.caetgories}]}},
            {
                $project: {
                    'sku': 1,
                    "name": 1,
                    "assets.stockQuantity": 1,
                    "assets.photo": 1,
                    'price': 1,
                    'info.category': 1,
                    'info.brand': 1
                }
            }
        ]);

        console.log(response);
        res.json({data: response, categories: categories});
    } catch (err) {
        console.log(err);
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
    const sellerID = req.tokenData.id;
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

async function updateDetails(req, res) {

    const userToken = req.body.data.info.token;
    const payload = JSON.parse(atob(userToken.split('.')[1]));
    console.log(payload);

    const email = payload.email;
    const role = payload.role;
    const data = req.body.data;

    console.log(data)

    if (data && role == 'admin' && email && data.name && data.name.firstname !== undefined) {
        const firstname = data.name.firstname;

        try {
            const response = await users.updateOne(
                { 'email': email, 'role': role },
                {
                    $set: {
                        email: data.email,
                        'name.firstname': firstname,
                        'name.lastname': data.name.lastname,
                        'mobile': data.mobile,
                        'info.address': data.info.address,
                        'info.gender': data.info.gender,
                        'info.dob': data.info.dob,
                    },
                }
            );

            if (response.modifiedCount === 1) {
                const updatedUser = await users.findOne({ 'email': data.email, 'role': role });
                return res.status(200).json(updatedUser);
            } else {
                return res.status(404).json({ error: 'User not found or no changes were made' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(400).json({ error: 'Invalid data structure or missing firstname' });
    }
}

async function getAdminDetails(req, res) {
    const userToken = req.query.token;
    const payload = JSON.parse(atob(userToken.split('.')[1]));
    console.log(userToken);

    try {
        const response = await users.find({ role: 'admin', email: payload.email });
        if (response) {
            return res.status(200).json(response);
        }
        throw "404";
    } catch (err) {
        console.log(err);
        return res.status(404).send();
    }
}



function dataTranformation(product, sellerID) {
    let data = {
        'sellerID': sellerID,
        'sku': 'sku-kurta001',
        'name': product.basicinfo.name,
        'subTitle': product.basicinfo.subtitle,
        'description': product.basicinfo.description,
        'assets': product.productDesc.map((item) => {
            item.photo = item.photo.image;
        }),
        'info': {
            'code': product.basicinfo.code,
            'category': product.basicinfo.category,
            'gender': (product.basicinfo.gender).toLowerCase(),
            'sizes': product.basicinfo.sizes,
            'brand': product.basicinfo.brand,
            'weight': product.basicinfo.weight,
            'composition': product.basicinfo.materialType,
            'tags': product.basicinfo.tags,
            'orderQuantity': product.basicinfo.orderQuantity
        },
        'price': product.basicinfo.actualprice
    }
    return data;
}

module.exports = {
    addProduct,
    fetchProducts,
    fetchProductDetails,
    updateProductDetails,
    updateDetails,
    getAdminDetails
}