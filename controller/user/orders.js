const ordersModel = require('../../models/order');

// get particular user orders
async function getOrders(req,res){
    try {
        const userOrders=await ordersModel.findOne({buyerId:req.body._id});
        res.status(200).json(userOrders);
    } catch (error) {
        if(error.message){
            res.status(500).json(error);
            return;
        }

        res.status(500).json(error);
    }
}


module.exports={
    getOrders
}