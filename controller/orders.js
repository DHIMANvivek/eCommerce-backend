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
        req.body.buyerId=req.tokenData.id;
        // console.log('create order srtated ',req.body.);
        const fetchProducts=await ProductController.fetchProducts();
        // console.log('fetchProcduts is ',fetchProducts);
        
        
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