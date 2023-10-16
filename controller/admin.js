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





module.exports = {
    addProduct,
    fetchProducts,
    fetchProductDetails,
    updateProductDetails,
    updateDetails,
    getAdminDetails
}