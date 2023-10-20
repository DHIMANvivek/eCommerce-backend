const users = require('../models/users');
const products = require('../models/products');
const sellerInfo = require('../models/sellerDetails');
const reviewsController = require('../controller/reviews');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const faqData = require('../models/faq');

const OffersModel = require('../models/offers');

async function addProduct(req, res) {
    const sellerID = req.tokenData.id;
    const productObject = req.body;

    try {
        if (productObject.type == 'bulk') {
            const response = await products.insertMany(productObject.data);
        } else {

            Object.keys(productObject.data.basicinfo).forEach((key) => {
                productObject.data[key] = productObject.data.basicinfo[key];
            });
            productObject.data.sellerID = sellerID;
            productObject.data.sku = "sku-kurta001";
            delete productObject.data.basicinfo;
            const response = await products.create(productObject.data);
            return res.status(200).json("uploaded");
        }
    } catch (err) {
        console.log(err);
    }
}

async function updateProduct(req, res) {
    const sellerID = req.tokenData.id;
    const productObject = req.body;
    const _id = productObject.data._id;

    try {
        // Transform Data
        Object.keys(productObject.data.basicinfo).forEach((key) => {
            productObject.data[key] = productObject.data.basicinfo[key];
        });
        delete productObject.data['basicinfo'];
        delete productObject.data['_id'];

        console.log(productObject.data, _id);

        const response = await products.updateOne({
            '_id': _id,
            'sellerID': sellerID
        }, { $set: productObject });

        console.log(response);
        return res.status(200).json("uploaded");
    } catch (err) {
        console.log(err);
    }
}

async function deleteProductInventory(req, res){
    console.log(req.body);
    const sellerID = req.tokenData.id;
    const reqData = req.body;

    try{
        // console.log(reqData.data.map((productID)=>{
        //     return products.updateOne({'sellerID': sellerID, '_id': productID}, {$set: {'active': false}});
        // }));
        let response;
        if(Array.isArray(reqData.data)){
            response = await products.updateMany({'sellerID': sellerID, _id: {$in: reqData.data}}, {$set: {'active': false}});
        }
        response = await products.updateOne({'sellerID': sellerID, _id: reqData.data}, {$set: {'active': false}});

        // const response = await Promise.all(reqData.data.map((productID)=>{
        //     return products.updateOne({'sellerID': sellerID, '_id': productID}, {$set: {'active': false}});
        // }));
        console.log(response);
        if(!response) throw "Unable to Delete";

        return res.status(200).json({message: 'Products Deleted'})
    }catch(err){
        return res.status(409).json({message: 'Products not Deleted'})
    }
}

async function fetchProductInventory(req, res) {
    const sellerID = req.tokenData.id;
    const parameters = req.body;
    try {
        aggregationPipe = [
            {
                $match: {
                    $or: [
                        { "name": { $regex: parameters.search, $options: 'i' } },
                        { "info.category": { $regex: parameters.search, $options: 'i' } },
                    ]
                }
            },
            {
                $project: {
                    'sku': 1,
                    "name": 1,
                    "assets": 1,
                    "info.orderQuantity": 1,
                    'price': 1,
                    'info.category': 1,
                    'info.brand': 1,
                    'updatedAt': 1
                }
            },
            { $skip: (parameters.page - 1) * parameters.limit },
            { $limit: parameters.limit }
        ];

        if (parameters.filter['categories']) {
            aggregationPipe.unshift({ $match: { 'info.category': { $regex: parameters.filter['categories'], $options: 'i' } } },)
        }
        aggregationPipe.unshift({ $match: { 'sellerID': new ObjectId(sellerID), 'active': true } },)

        let response = await products.aggregate(aggregationPipe);
        console.log("pipe", aggregationPipe);

        response = response.map((product) => {
            let stockAmt = 0;
            let unitSold = 0;

            product.assets.map((assets) => {
                assets.stockQuantity.map(stock => {
                    stockAmt += stock.quantity;
                    unitSold += stock.unitSold;
                })
            });
            product.totalStock = stockAmt;
            product.unitSold = unitSold;
            return product;
        });
        response = await Promise.all(response.map(async (product) => {
            product.avgRating = (await reviewsController.fetchReviews(product._id)).avgRating;
            return product;
        }));

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
    }
}

async function fetchFeatures(req, res) {
    const sellerID = req.tokenData.id;
    const data = req.body;

    console.log("hello");
    try {
        let response;
        let query = {};
        data.forEach((field) => {
            query[field] = 1
        })

        if (sellerID)
            response = await sellerInfo.findOne({ 'sellerID': sellerID }, query);
        else
            response = await sellerInfo.findOne({}, query);

        if (response) {
            return res.status(200).json(response);
        }
        throw "404";
    } catch (err) {
        console.log(err);
        return res.status(404).send();
    }
}

async function updateFeatures(req, res) {
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

async function createOffer(req, res) {
    try {
        const offer = await OffersModel(req.body);
        await offer.save();
        res.status(200).json(offer);
    } catch (error) {
        res.status(500).json(error);
    }
}


// function helper(Array, productPrice) {
//     let productDiscount = 0;
//     Array.forEach((element) => {
//         if (element.discountType == 'percentage') {
//             let discountPrice = Math.ceil((productPrice * element.discountAmount) / 100);
//             if (discountPrice > productDiscount) {
//                 productDiscount = discountPrice;
//             }
//         }
//         else {
//             if (element.discountAmount > productDiscount) productDiscount = element.discountAmount;
//         }
//     })

//     return productDiscount;
// }


// async function getProductPrice(req, res) {
//     try {

//         let productDiscount;
//         let productCategory = 'Kurti';
//         let productPrice = 1000;
//         let productBrand = 'Sangria';
//         let globalDiscounts = await OffersModel.find({ 'ExtraInfo': { $exists: 0 } }, { 'discountType': 1, 'discountAmount': 1 });
//         productDiscount = helper(globalDiscounts, productPrice);
//         let anotherDiscount = await OffersModel.find(
//             { "ExtraInfo.categories": { $in: [productCategory] } }, { 'discountType': 1, 'discountAmount': 1 });
//         let result = helper(anotherDiscount, productPrice);
//         if (result > productDiscount) productDiscount = result;



//         res.status(200).json(productDiscount);

//     } catch (error) {
//         res.status(500).json(error);
//     }
// }

async function getOffers(req, res) {
    try {

        const data = await OffersModel.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error);
    }
}
async function deleteOffer(req, res) {
    try {
        const offerdeleted = await OffersModel.updateOne({ _id: req.body.id }, { $set: { "status.deleted": true } });
        res.status(200).json({ message: 'Deleted Successfully' });
    } catch (error) {
        res.status(500).json(error);
    }
}

async function updateFaq(req, res) {
    console.log(req.body)
    try {
      const updateFaqData = req.body;
      const itemId = updateFaqData._id;
      const updatedTitle = updateFaqData.title; 
      const updatedContent = updateFaqData.content;
  

      const result = await faqData.findOneAndUpdate(
        { 'childrens._id': itemId },
        {
          $set: {
            'childrens.$.title': updatedTitle,
            'childrens.$.content': updatedContent,
          },
        },
        { new: true } 
      );
  
      if (!result) {
        return res.status(404).json({ error: 'FAQ item not found' });
      }
  
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the FAQ item' });
    }
  }

  async function addFaq(req, res) {
    try {
        const { title, children } = req.body; 

        const category = await faqData.findOne({ title });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        category.childrens.push(...children);

        await category.save();

        return res.status(200).json({ success: true, message: 'Children added to the category' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'An error occurred while adding children to the category' });
    }
  }

  async function deleteFaq(req, res) {
    try {
        const itemId = req.body._id;
        console.log(itemId)
        const result = await faqData.findOneAndUpdate(
            { 'childrens._id': itemId },
            {
                $pull: {
                    childrens: { _id: itemId },
                },
            },
            { new: true }
        );
        console.log(result)
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while deleting the FAQ item' });
    }
}
  



module.exports = {
    addProduct,
    updateProduct,
    deleteProductInventory,
    fetchProductInventory,
    fetchFeatures,
    updateFeatures,
    updateDetails,
    getAdminDetails,
    createOffer,
    getOffers,
    deleteOffer,
    // getProductPrice,
    updateFaq,
    deleteFaq,
    addFaq
}

