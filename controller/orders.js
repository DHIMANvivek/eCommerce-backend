const ordersModel = require('./../models/order');
const userModel = require('./../models/users');
const { checkCoupon, updateCoupon, } = require('../controller/offers');
const Products = require('../models/products')
const moongoose = require('mongoose');
const ProductController = require('../controller/products');
const productsModel = require('./../models/products');
const logger = require('./../logger');
const order = require('./../models/order');

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
        const buyerId = req.tokenData.id;
        // console.log('update order called----> ',req.body);

        const response = await ordersModel.findOne({ orderID: req.body.orderID, payment_status: 'success' }, { _id: 0, coupon: 1, products: 1 });
        if (response?.coupon) {
            await updateCoupon(response.coupon, buyerId);
        }

        if (response?.products) {
            await Promise.all(response.products.map(async (el) => {
                console.log('el of products array ios ',el);
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

                let particularProduct = await Products.findOne({ sku: el.sku });
                const allStockZero = particularProduct.assets.every(color => {
                    return color.stockQuantity.every(size => size.quantity === 0);
                });

                if (allStockZero) {
                    await Products.updateOne({ sku: el.sku }, { $set: { "status.active": false } });
                }

            }));


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

async function verifyOrderSummary(req, res, productData = false) {
    try {
        let FinalResponse = {};
        FinalResponse.savings = 0;
        FinalResponse.shipping = 0;
        FinalResponse.total = 0;
        FinalResponse.subTotal = 0;
        allProducts = JSON.parse(JSON.stringify(req.body.products));
        let newProducts;
        if (productData) {
            newProducts = [];
        }

        await Promise.all(allProducts.map(async (element) => {
            let response = await ProductController.fetchProductDetails(req, res, element.sku);

            FinalResponse.total += element.price * element.quantity;
            if (response?.discount) {
                FinalResponse.savings += response.discount * element.quantity;
            }
            if (element?.oldPrice) {
                FinalResponse.subTotal += element?.oldPrice * element.quantity;
            }


            return new Promise((res, rej) => {
                let colorArray = response.assets?.filter(el => el.color == element.color);
                let particularColor = colorArray?.filter(el => el.color == element.color);
                particularColor = particularColor[0].stockQuantity;
                let particularColorSize = particularColor?.filter(el => el.size == element.size);
                if (particularColorSize[0].quantity <= 0) {
                    rej({ message: response.name + ' is out of stock' });
                }

                if (productData) {
                    let elementDetails = {
                        sellerID: response.sellerID, sku: response.sku, productInfo: { name: response.name, image: element.image, category: response.info.category, brand: response.info.brand },
                        quantity: element.quantity, color: element.color, size: element.size, price: element.price,
                        _id: element._id
                    };
                    newProducts.push(elementDetails);
                }

                if (response?.oldPrice) {
                    res({ price: response.price * element.quantity, oldPrice: response?.oldPrice * element.quantity });
                }
                else {
                    res({ price: response.price * element.quantity });
                }
            });
        }));


        if (req.body.couponId && req?.tokenData?.id) {
            let coupon = await checkCoupon(req.body.couponId, req.tokenData.id);
            if (!coupon) { throw ({ message: 'Sorry This Coupon is not available for you' }) }
            if (coupon.discountType == 'percentage' && coupon.minimumPurchaseAmount > FinalResponse.total) { throw ({ message: `Minimum Purchase Amount is ${coupon.minimumPurchaseAmount}` }) }
            let discount = 0;
            if (coupon.discountType == 'percentage') {
                let discountCalculated = (FinalResponse.total / 100) * coupon.discountAmount;
                discount = discountCalculated <= coupon.maximumDiscount ? discountCalculated : coupon.maximumDiscount;
                discount = discount >= FinalResponse.total ? 0 : discount
            }
            else {
                discount = coupon.discountAmount
                discount = discount >= req.body.amounts.total ? 0 : discount
            }

            FinalResponse.discount = discount;
        }


        if (productData) {
            req.body.products = newProducts;
        }
        return new Promise((res, rej) => {
            res(FinalResponse);
        });

    } catch (error) {
        logger.error(error);
        res.status(500).json(error);
    }
}

async function createOrder(req, res) {
    try {
        const verifyOrder = await verifyOrderSummary(req, res, true);
        req.body.buyerId = req.tokenData.id;
        delete req.body.details;
        req.body.OrderSummary = {};
        req.body.OrderSummary.subTotal = verifyOrder?.total;
        if (verifyOrder?.discount) {
            req.body.OrderSummary.couponDiscount = verifyOrder.discount;
            req.body.coupon=req.body.couponId;
            let sum = req.body.products.reduce((acc, val) => {
                return val.price * val.quantity + acc
            }, 0);
            let productUpdated = JSON.parse(JSON.stringify(req.body.products)).map((el) => {
                 el.productDiscount = Math.floor(((el.price * el.quantity) / sum) * req.body.OrderSummary.couponDiscount);
                 return el;
            })

            req.body.products=productUpdated;
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

async function getIndividualOrders(req, res) {
    try {
        const getAllOrders = await ordersModel.find({ buyerId: req.tokenData.id, payment_status: 'success' }).sort({ createdAt: -1 });
        if (!getAllOrders || getAllOrders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }
        res.status(200).json(getAllOrders);
    } catch (error) {
        console.error('Error fetching individual orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getParicularUserOrders(req, res) {
    try {
        // const getAllOrders = await ordersModel.find({ buyerId: req.tokenData.id ,payment_status:'sucess'}).sort({ createdAt: -1 });

        let parameters = req.body;
        let active =(parameters?.active);
        const skip = (parameters.currentPage - 1) * parameters.limit;
        const limit = parameters.limit;

        let aggregationPipe = [
            {
                $match: {
                    buyerId: new moongoose.Types.ObjectId(req.tokenData.id),
                    active: active,
                    'products.payment_status':parameters.paymentStatus
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $group: {
                    _id: null,
                    count: {
                        $sum: 1,
                    },
                    document: {
                        $push: "$$ROOT",
                    },
                },
            },
            {
                $project: {
                    count: 1,
                    document: { $slice: ['$document', skip, limit] }
                }
            }
        ];

        const data = await ordersModel.aggregate(aggregationPipe);
        res.status(200).json(data);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getSellerOrdersInventory(req, res) {
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
                            $unwind: "$orderDetails.products"
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
                    aggregationPipe.splice(aggregationPipe.length - 1, 0, {
                        $match: {
                            $or: [
                                { 'customer': { $regex: parameters.filter['search'], $options: 'i' } },
                                { 'orderDetails.orderID': { $regex: parameters.filter['search'], $options: 'i' } },
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

        // console.log(response);

        let order = JSON.parse(JSON.stringify(response));
        // const response = await ordersModel.find({_id: OrderID, 'products.sellerID': sellerID}, {'products.sellerID.$': 1, buyerId: 1}).populate('buyerId');
        if (req.tokenData.role == 'admin') {
            const sellerAddress = await userModel.findById({ _id: sellerID }, { 'info.address': 1, email: 1, _id: 0 });
            order['sellerAddress'] = sellerAddress;
            console.log(order);
            res.status(200).json(order);
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

async function getOverallOrderData(req, res, controller = false) {
    // const sellerID = req.tokenData.id;

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

        // if(controller) return statistics;
        return res.status(200).json(statistics);

    } catch (err) {
        res.status(500).json({ "message": "Error Occureed" });
    }
}


async function cancelOrderedProduct(req, res) {
    try {

        const decreasingAmount=req.body.product.amount-(req.body.product?.productDiscount?req.body.product?.productDiscount:0);

        const orderUpdate = await ordersModel.findByIdAndUpdate(
            req.body.id,
            { 
                $set: {
                 'products.$[elem].shipmentStatus': 'cancelled', 
                 'products.$[elem].payment_status': 'refund',
                 
                }, 
                $inc:{'OrderSummary.Total':-Math.floor(decreasingAmount)}
            },
            { arrayFilters: [{ 'elem.sku': req.body.product.sku }], new: true }
        );

        //    if(orderUpdate) 

       let check= orderUpdate.products.every((el)=>(el.shipmentStatus=='cancelled' && el.payment_status=='refund'));
        if(check){
          await ordersModel.findByIdAndUpdate(
                req.body.id,
                { $set: { active: false,'OrderSummary.Total':0 },
        
                },
            );
        }
  

        return res.status(200).json({ message: 'Product cancelled successfully' });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'Error cancelling the product' });
    }
}

async function cancelOrder(req, res) {
    try {
        const orderUpdate = await ordersModel.findByIdAndUpdate(
            req.body.orderId,
            { $set: { active: false ,'OrderSummary.Total':0} },
        );

        return res.status(200).json({ message: 'Order cancelled successfully' });
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
    cancelOrder,
    getIndividualOrders,
    getSellerOrdersInventory,
    getSellerOrderDetails,
    updateLatestOrderDetail,
    getOverallOrderData,
    cancelOrderedProduct,
    getLatestOrderId,
}