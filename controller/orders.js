const ordersModel = require('./../models/order');
const {getProductPrice}=require('../controller/products');
const ProductController=require('../controller/products');
async function getOrders(req, res) {
    try {
        const userOrders = await ordersModel.findOne({ buyerId: req.body._id });
        res.status(200).json(userOrders);
    } catch (error) {
        if (error.message) {
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }
}

async function CreateOrder(req,res){
    try {

        // console.log('body coming is ',req.body," tokenData is ",req.tokenData);

        // req.body.products.forEach(async element => {
        //     const data=ProductController.fetchProductDetails(element.sku);
        // });
        
            // req.body.details.forEach(async (element) => {
            //     let response =await ProductController.fetchProductDetails();
            //     console.log('response is ',response);
            // });
        res.status(200).json({message:'Order created Succes'});
    } catch (error) {
        console.log('error is ',error);
            res.status(500).json(error);
    }
}

module.exports = {
    getOrders,
    CreateOrder
}