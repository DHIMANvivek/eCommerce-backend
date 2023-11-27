const ordersModel = require('./../models/order');
const userModel = require('./../models/users');
const { checkCoupon, updateCoupon, } = require('../controller/offers');
const Products = require('../models/products')
const ProductController = require('../controller/products');
const productsModel = require('./../models/products');
const logger = require('./../logger');

async function getLatestOrderId(req, res) {
    try {
        const result = await ordersModel.findOne({ buyerId: req.tokenData.id }).sort({ createdAt: -1 });
        if (!result) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ orderID: result.orderID });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: 'Failed to get the latest order' });
    }
}


async function updateLatestOrderDetail(req, res) {
    try {
        console.log('update order called ');
        const buyerId = req.tokenData.id;
        const { newPaymentStatus, transactionId, MOP } = req.body;
        const result = await ordersModel.updateOne(
            { orderID: req.body.orderID },
            {
                $set: {
                    payment_status: newPaymentStatus,
                    transactionId: transactionId,
                    MOP: MOP,
                }
            }
        );

        if (!result) {
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log('coming to reduce producdts ',req.body.products);
        await Promise.all(req.body.products.map(async (el) => {
            await Products.updateOne(
                {
                    sku: el.sku,
                    'assets.color': el.color,
                    'assets.stockQuantity.size': el.size
                },
                {
                    $inc: { 'assets.$[outer].stockQuantity.$[inner].quantity': -el.quantity, 'assets.$[outer].stockQuantity.$[inner].unitSold': el.quantity },
                },
                {
                    arrayFilters: [
                        { "outer.color": el.color },
                        { "inner.size": el.size }
                    ]
                }
            );
        }));


        console.log('coming to coupon', req.body.coupon);
        if (req.body.coupon) {
            await updateCoupon(coupon._id);
        }

        res.status(200).json({ message: 'Latest order payment status updated successfully' });

    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: 'Failed to update the latest order payment status' });
    }
}



async function VerifyOrder(req, res) {
    try {
        const verify = await verifyOrderSummary(req, res);
        res.status(200).json(verify);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function verifyOrderSummary(req, res) {
    try {
        let FinalResponse = {};
        FinalResponse.savings = 0;
        FinalResponse.shipping = 0;
        FinalResponse.total=0;
        FinalResponse.subTotal=0;
        if (!req.body?.details) {
            req.body.details = req.body.products;
        }


        console.log('req bod is ',req.body);
        let result = await Promise.all(req.body.details.map(async (element) => {
            let response = await ProductController.fetchProductDetails(req, res, element.sku);
            if (response?.discount) {
                FinalResponse.savings += response.discount;
            }
            return new Promise((res, rej) => {
                if (response.info.orderQuantity.includes(element.quantity)) {
                    return res(response.price * element.quantity);
                }

                let colorArray = response.assets.filter(el => el.color == element.color);

                let sizeArray = colorArray[0].stockQuantity.filter(el => el.size == element.size);
                element.quantity = sizeArray[0].quantity;
                if (sizeArray[0].quantity > 0) return res(sizeArray[0].quantity * response.price);


                element.quantity = sizeArray[0].quantity;
                if (sizeArray[0].quantity > 0) return res(sizeArray[0].quantity * response.price);

                rej({ message: 'Sorry Order Quantity Selected is not available' });
            });
        }));

        let totalAmount = result?.reduce((accumlater, currentValue) => {
            return accumlater + currentValue;
        })

        FinalResponse.subTotal = totalAmount;
        FinalResponse.total=FinalResponse.subTotal-FinalResponse.savings;
        if (req.body.CouponApplied) {
            let coupon = await checkCoupon(req.body.CouponApplied._id, req.tokenData.id);
            if (!coupon) { throw ({ message: 'Sorry This Coupon is not available for you' }) }
            if (coupon.discountType == 'percentage' && coupon.minimumPurchaseAmount > totalAmount) { throw ({ message: `Minimum Purchase Amount is ${coupon.minimumPurchaseAmount}` }) }
            let discount = 0;
            if (coupon.discountType == 'percentage') {
                let discountCalculated = (totalAmount / 100) * coupon.discountAmount;
                discount = discountCalculated <= coupon.maximumDiscount ? discountCalculated : coupon.maximumDiscount;
                discount = discount >= req.body.amounts.total ? 0 : discount
            }
            else {
                discount = coupon.discountAmount
                discount = discount >= req.body.amounts.total ? 0 : discount
            }

            FinalResponse.savings += discount;
            FinalResponse.total-=discount;
        }



        if (!FinalResponse.total) FinalResponse.total = FinalResponse.subTotal;
        return new Promise((res, rej) => {
            res(FinalResponse);
        });

    } catch (error) {
        logger.error(error);
        console.log('error come up is ',error);
        res.status(500).json(error);
    }
}

async function createOrder(req, res) {
    try {

        const verifyOrder = await verifyOrderSummary(req, res);
        req.body.buyerId = req.tokenData.id;
        if (req.body.coupon) {
            let response = await checkCoupon(req.body.coupon._id, req.tokenData.id);
            if (!response) { throw ({ message: 'You already use this coupon' }) }
        }

        // order ID creation
        const UserLastOrder = await ordersModel.findOne({ buyerId: req.tokenData.id }).sort({ createdAt: -1 });
        if (!UserLastOrder) {
            let result = (req.tokenData.id);
            req.body.orderID = 'ORDER-' + result.substring(result.length - 4) + '-' + 1;
        }
        else {
            req.body.orderID = UserLastOrder?.orderID?.slice(0, -1) + (Number(UserLastOrder.orderID.slice(-1)) + 1);
        }

        const orderCreated = ordersModel(req.body);
        await orderCreated.save();
        res.status(200).json({ orderId: req.body.orderID });

    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function getParicularUserOrders(req, res) {
    try {
        const getAllOrders = await ordersModel.find({ buyerId: req.tokenData.id }).sort({ createdAt: -1 });
        res.status(200).json(getAllOrders);
    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function getSellerOrdersInventory(req, res, controller=false) {
    // let sellerID = req.tokenData.id;
    let parameters = req.body;

    try {

        let aggregationPipe = [
            {
                $lookup: {
                    from: "users",
                    localField: "buyerId",
                    foreignField: "_id",
                    as: "buyerInfo",
                },
            },
            {
                $unwind: {
                    path: "$buyerInfo",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    customer: {
                        $concat: [
                            "$buyerInfo.name.firstname",
                            " ",
                            "$buyerInfo.name.lastname",
                        ],
                    },
                    orderDetails: "$$ROOT",
                },
            },
            {
                $facet: {
                    orders: [
                        {
                            $unwind: {
                                path: "$orderDetails.products",
                            },
                        },
                        {
                            $group: {
                                _id: "$_id",
                                orderQuantity: {
                                    $sum: "$orderDetails.products.quantity",
                                },
                                data: {
                                    $first: "$$ROOT.orderDetails",
                                },
                                customer: {
                                    $first: "$$ROOT.customer"
                                }
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                orderQuantity: 1,
                                data: 1,
                                customer: 1,
                            },
                        },
                        {
                            $sort: { 'data.orderDate': -1, },
                        },
                    ],
                    total: [
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
        ];


        Object.keys(parameters.filter).forEach((key) => {
            if (parameters.filter[key]) {
                if (key == 'search') {
                    aggregationPipe.splice(1, 0, {
                        $match: {
                            $or: [
                                { 'buyerInfo.customer': { $regex: parameters.filter['search'], $options: 'i' } },
                                { 'orderID': { $regex: parameters.filter['search'], $options: 'i' } },
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

        aggregationPipe[aggregationPipe.length - 1].$facet.orders.push(
            { $skip: (parameters.page - 1) * parameters.limit },
            { $limit: parameters.limit }
        );
        const response = await ordersModel.aggregate(aggregationPipe);
        if (response) {
            return res.status(200).json(response[0]);
        } else {
            throw "Order not Found";
        }
    } catch (err) {

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
        res.status(500).json(error);
    }
}

async function getOverallOrderData(req, res) {
    const sellerID = req.tokenData.id;

    try {
        const statistics = await ordersModel.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: {
                        paymentStatus: '$payment_status',
                        shipmentStatus: "$products.shipmentStatus"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    paymentStatus: '$_id.paymentStatus',
                    shipmentStatus: "$_id.shipmentStatus",
                    count: 1
                }
            }
        ]);


        if (!statistics) {
            return res.status(401).send();
        }
        statistics.forEach((stats) => {
            // stats.paymentStatus == 'success' || stats.paymentStatus == 'pending'
            if (stats.paymentStatus == 'success') {
                if (stats.shipmentStatus == 'pending') {
                    stats['status'] = 'confirmed';
                } else if (stats.shipmentStatus == 'cancelled' || stats.shipmentStatus == 'declined') {
                    stats['status'] = 'cancelled';
                } else
                    stats['status'] = stats.shipmentStatus;
            } else if (stats.paymentStatus == 'cancelled' && stats.shipmentStatus == 'cancelled') {
                stats['status'] = 'cancelled';
            } else { }
        });
        return res.status(200).json(statistics);
    } catch (err) {
        res.status(500).json({ "message": "Error Occureed" });
    }
}


async function cancelOrderedProduct(req, res) {
    const { id, sku } = req.body;
    try {
        const orderUpdate = await ordersModel.updateOne({ _id: id, 'products.sku': sku }, { $set: { 'products.$.shipmentStatus': 'cancelled' } })
        return res.status(200).json({ message: 'Product cancelled successfully' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error cancelling the product' });
    }
}


module.exports = {
    createOrder,
    verifyOrderSummary,
    VerifyOrder,
    getParicularUserOrders,


    getSellerOrdersInventory,
    getSellerOrderDetails,
    updateLatestOrderDetail,
    getOverallOrderData,
    cancelOrderedProduct,
    getLatestOrderId
}