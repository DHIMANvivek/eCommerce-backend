const ordersModel = require('./../models/order');
const userModel = require('./../models/users');
const { getProductPrice } = require('../controller/products');
const { checkCoupon, updateCoupon, } = require('../controller/offers');
const ProductController = require('../controller/products');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

async function getOrders(req, res) {
    try {
        const userOrders = await ordersModel.findOne({ buyerId: req.body._id });
        return res.status(200).json(userOrders);
    } catch (error) {
        if (error.message) {
            res.status(500).json(error);
            return;
        }
        return res.status(500).json(error);
    }
}

async function verifyOrderSummary(req, res) {
    try {

        let response = {};
        let result = await Promise.all(req.body.details.map(async (element) => {
            let response = await ProductController.fetchProductDetails(req, res, element.sku);
            // console.log('elemnt is ',element);
            return new Promise((res, rej) => {
                if (response.info.orderQuantity.includes(element.quantity)) {
                    return res(response.price * element.quantity);
                }
                else {
                    rej(0);
                }
            });
        }));

        let totalAmount = result.reduce((accumlater, currentValue) => {
            return accumlater + currentValue;
        })

        response.subTotal = totalAmount;
        if (req.body.CouponApplied) {
            // let coupon= await checkCoupon(req.body.CouponApplied._id,req.tokenData.id);
            let coupon = req.body.CouponApplied;
            if (!coupon) { throw ({ message: 'Sorry This Coupon is not available for you' }) }
            if (coupon.minimumPurchaseAmount > totalAmount) { throw ({ message: `Minimum Purchase Amount is ${coupon.minimumPurchaseAmount}` }) }
            let discount = 0;
            if (coupon.discountType == 'percentage') {
                let discountCalculated = (totalAmount / 100) * coupon.discountAmount;
                // console.log('discountCalcluated is ',discountCalculated);
                discount = discountCalculated <= coupon.maximumDiscount ? discountCalculated : coupon.maximumDiscount;
            }
            else {
                discount = coupon.discountAmount <= coupon.maximumDiscount ? coupon.discountAmount : coupon.maximumDiscount;
            }

            totalAmount -= discount;
            response.savings = discount;
            response.total = totalAmount;
        }

        response.shipping = 0;
        if (!response.savings) response.savings = 0;
        if (!response.total) response.total = response.subTotal;
        res.status(200).json(response);
    } catch (error) {
        console.log('errpr comimg is ,', error);
        res.status(500).json(error);
    }
}

async function createOrder(req, res) {
    try {
        req.body.buyerId = req.tokenData.id;
        if (req.body.coupon) {
            let response = await checkCoupon(req.body.coupon._id, req.tokenData.id);
            if (!response) { throw ({ message: 'You already use this coupon' }) }
        }
        const orderCreated = ordersModel(req.body);

        response.shipping=0;
        if(!response.savings) response.savings=0;
        if(!response.total) response.total=response.subTotal;
        res.status(200).json(response);
        // console.log('body coming is ',req.body," tokenData is ",req.tokenData);

        // req.body.products.forEach(async element => {
        //     const data=ProductController.fetchProductDetails(element.sku);
        // });
        
        //     req.body.details.forEach(async (element) => {
        //         let response =await ProductController.fetchProductDetails();
        //         console.log('response is ',response);
        //     });
        // res.status(200).json({message:'Order created Succes'});
    } catch (error) {
        console.log('errpr comimg is ,',error);
            res.status(500).json(error);
    }
}


async function createOrder(req,res){
    try {
        req.body.buyerId=req.tokenData.id;
        if(req.body.coupon){
           let response= await checkCoupon(req.body.coupon._id,req.tokenData.id);
           if(!response){ throw({message:'You already use this coupon'})}
        }
        const orderCreated=ordersModel(req.body);
        orderCreated.save();

        await updateCoupon(req.body.coupon._id, req.tokenData.id);
        res.status(200).json('order created success');

    } catch (error) {
        console.log('error coming is ', error);
        res.status(500).json(error);
    }
}

async function getParicularUserOrders(req, res) {
    try {
        const getAllOrders = await ordersModel.find({ buyerId: req.tokenData.id });
        res.status(200).json(getAllOrders);
    } catch (error) {
        res.status(500).json(error);
    }
}


async function getSellerOrdersInventory(req, res) {
    let sellerID = req.tokenData.id;
    let parameters = req.body;

    try {


        let aggregationPipe = [
            { $unwind: { path: '$products' } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'buyerId',
                    foreignField: '_id',
                    as: 'buyerInfo'
                }
            },
            { $unwind: { path: '$buyerInfo' } },
            {
                $group: {
                    _id: '$_id',
                    orderQuantity: {
                        $sum: '$products.quantity'
                    },
                    customer: { $first: { $concat: ['$buyerInfo.name.firstname', ' ', '$buyerInfo.name.lastname'] } },
                    data: { $first: '$$ROOT' }
                }
            },
            {
                $project: {
                    _id: 1,
                    orderQuantity: 1,
                    data: 1,
                    customer: 1,
                }
            }
        ];


        Object.keys(parameters.filter).forEach((key) => {
            if (parameters.filter[key]) {
                if (key == 'search') {
                    aggregationPipe.push({
                        $match: {
                            $or: [
                                { 'customer': { $regex: parameters.filter['search'], $options: 'i' } },
                                { '_id': { $regex: parameters.filter['search'], $options: 'i' } },
                            ]
                        }
                    })
                }
                if (key == 'payment_status') {
                    aggregationPipe.unshift({ $match: { 'payment_status': { $regex: parameters.filter[key], $options: 'i' } } });
                }
                if (key == "datefrom") {
                    aggregationPipe.unshift({ $match: { 'orderDate': { $gte: new Date(parameters.filter[key]) } } });
                }
                if (key == 'dateto') {
                    aggregationPipe.unshift({ $match: { 'orderDate': { $lte: new Date(parameters.filter[key]) } } });
                }
            }
        });

        aggregationPipe.unshift({ $match: { 'active': true } });
        aggregationPipe.push(
            { $skip: (parameters.page - 1) * parameters.limit },
            { $limit: parameters.limit }
        );

        console.log(aggregationPipe);

        const response = await ordersModel.aggregate(aggregationPipe);

        console.log("response", response);

        if (response) {
            return res.status(200).json(response);
        } else {
            throw "Order not Found";
        }
    } catch (err) {
        console.log(err);
        return res.status(404).json({ message: err });
    }
}

async function getSellerOrderDetails(req, res) {
    const sellerID = req.tokenData.id;
    const OrderID = req.query.orderID;

    try {
        const response = await ordersModel.findOne(
            { _id: OrderID },
            {
                active: 0,
                _id: 0,
                createdAt: 0,
                updatedAt: 0
            }
        ).populate('buyerId',
            {
                'name': 1,
                'email': 1,
                'mobile': 1,
                '_id': 0
            });

        let order = JSON.parse(JSON.stringify(response))
        // const response = await ordersModel.find({_id: OrderID, 'products.sellerID': sellerID}, {'products.sellerID.$': 1, buyerId: 1}).populate('buyerId');
        if (req.tokenData.role == 'admin') {
            const sellerAddress = await userModel.findById({ _id: sellerID }, { 'info.address': 1, email: 1, _id: 0 });
            order['sellerAddress'] = sellerAddress;
            res.status(200).json(order);
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    getOrders,
    createOrder,
    verifyOrderSummary,
    getParicularUserOrders,
    getSellerOrdersInventory,
    getSellerOrderDetails
}