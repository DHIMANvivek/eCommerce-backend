const users = require('../models/users');
const products = require('../models/products');
const reviews = require('../models/reviews');
const orders = require('../models/order');

const sellerInfo = require('../models/sellerDetails');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// // const faqData = require('../models/faq');
// const Ticket = require('../models/supportTicket');
// const Title = require('../models/createTicket');
const faqData = require('../models/custom-website-elements/faq');
const Ticket = require('../models/support-ticket/supportTicket');
const Title = require('../models/support-ticket/TicketStatus');
const SKU_generater = require('../helpers/sku');
// const PaymentKeys = require('../models/paymentKeys');
// const paginateResults = require('../helpers/pagination');

const productController = require('../controller/products');
const Notification = require('../models/notifications/notifications')
const OffersModel = require('../models/offers');
// const webPush = require('../models/support-ticket/SupportNotificationTokens');
const { updateItem } = require('./cart');

async function getOverallInfo(req, res, controller=false) {
  try {
    let result = {};
    // const customerCountCurr = await users.find({ 'role': { $not: { $eq: 'admin' } } }).count();

    // const customerCountPrev = await users.find({
    //   'role': { $not: { $eq: 'admin' } },
    //   'createdAt': { $lte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 31) }
    // }).count();

    const customerCountCurr = (await orders.distinct('buyerId', {payment_status: 'success'})).length;

    const customerCountPrev = (await orders.distinct('buyerId', {
      payment_status: 'success',
      'createdAt': { $lte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 31) }
    })).length;


    let customerChange = customerCountPrev ? (((customerCountCurr - customerCountPrev)) / customerCountPrev) * 100 : 0;

    result['customer'] = {
      'count': customerCountCurr,
      'change': Math.floor(customerChange)
    };

    const orderCountTotal = await orders.find({ payment_status: 'success', }).count();

    const orderCountPrev = await orders.find({
      payment_status: 'success',
      'orderDate': { $lte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 31) }
    }).count();

    let currentOrders=orderCountTotal-orderCountPrev;
    let orderChange = orderCountPrev ? ((currentOrders-orderCountPrev) / orderCountPrev) * 100 : 0;

    result['orders'] = {
      'count': orderCountTotal,
      'change': Math.floor(orderChange)
    };

    const alertStats = await products.aggregate([
      {
        $unwind: {
          path: "$assets",
          includeArrayIndex: "string",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$assets.stockQuantity",
          includeArrayIndex: "string",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null,
          alertCount: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    "$assets.stockQuantity.quantity",
                    {
                      $arrayElemAt: [
                        "$$ROOT.info.orderQuantity",
                        0]
                    },
                  ]
                }, 1, 0],
            },
          },
        },
      },
    ]);
    result['alertCount'] = alertStats[0].alertCount;

    const revenue = await orders.aggregate([
      {
        $unwind: "$products",
      },
      {
        $facet: {
          prev: [
            {
              $match: {
                payment_status: "success",
                orderDate: {
                  $lte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() - 1,
                    31
                  ),
                },
                "products.shipmentStatus": {
                  $nin: ["cancelled", "declined"],
                },
              },
            },
            {
              $group: {
                _id: null,
                overallDiscount: {
                  $sum: "$discount",
                },
                totalsales: {
                  $sum: "$products.amount",
                },
              },
            },
            {
              $project: {

                _id: 0,
                totalSales: {
                  $subtract: [
                    "$totalsales",
                    "$overallDiscount",
                  ],
                },
              },
            },
          ],
          total: [
            {
              $match: {
                payment_status: "success",
                "products.shipmentStatus": { $nin: ['cancelled', 'declined'] }
              },
            },
            {
              $group: {
                _id: null,
                overallDiscount: {
                  $sum: "$discount",
                },
                totalsales: {
                  $sum: "$products.amount",
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalSales: {
                  $subtract: [
                    "$totalsales",
                    "$overallDiscount",
                  ],
                },
              },
            },
          ],
        },
      },
    ]);

    result['revenue'] = {
      total: revenue[0].total[0].totalSales,
      change: revenue[0].prev ? 0 : Math.floor(((revenue[0].total[0].totalSales - revenue[0].prev[0].totalSales) / revenue[0].total[0].totalSales) * 100)
    }

    if (controller) return result;
    res.status(200).json(result);

  } catch (err) {

  }
}

async function fetchProductSalesData(req, res) {
  let controller = req.controller ? true : false;
  const data = req.tokenData;
  const type = req.query.type;

  try {
    if (data.role == 'admin') {

      let aggregationPipe = [
        {
          $unwind: "$products",
        },
        {
          $lookup: {
            from: "products",
            localField: "products.sku",
            foreignField: "sku",
            as: "products.info",
          },
        },
        {
          $unwind: {
            path: "$products.info",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            payment_status: "success",
            'products.shipmentStatus': { $nin: ['cancelled', 'declined'] }
          },
        }
      ];

      let groupbyQuery = {

        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
          },
          overallDiscount: { $sum: "$discount" },
          totalsales: {
            $sum: "$products.amount"
          },
          totalExpenses: {
            $sum: {
              $multiply: [
                "$products.info.costPrice",
                "$products.quantity",
              ],
            }
          }
        },
      };

      if (type == 'yearly') {
        delete groupbyQuery.$group._id.date;
        aggregationPipe.push(
        )
      } else {
        groupbyQuery.$group._id.date = { $dayOfMonth: "$orderDate" };
      }

      aggregationPipe.push(
        groupbyQuery,
        {
          $project: {
            _id: 1,
            totalSales: {
              $subtract: ['$totalsales', '$overallDiscount'],
            },
            totalExpenses: 1,
            totalProfit: {
              $subtract: [
                { $subtract: ['$totalsales', '$overallDiscount'] },
                '$totalExpenses'
              ]
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      );

      const salesStats = await orders.aggregate(aggregationPipe);
      if (!salesStats) throw 401;
      if (controller) return salesStats;

      return res.status(200).json(salesStats);
    }
  } catch (err) {
    return res.status(401).send();

  }
}

async function fetchPopularProducts(req, res) {
  let controller = req.controller ? true : false;
  try {

    const popularProductStats = await orders.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          payment_status: "success",
          'products.shipmentStatus': { $nin: ['cancelled', 'declined'] },
         //products only for particular month (current)
          $expr: {
            $eq: [
              { $month: "$orderDate" },
              { $month: new Date() },
            ]
          }
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.sku",
          foreignField: "sku",
          as: "products.info",
        },
      },
      {
        $unwind: {
          path: "$products.info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$products.info._id",
          revenue: { $sum: "$products.amount" },
          profit: {
            $sum: {
              $subtract: [
                "$products.amount",
                {
                  $multiply: [
                    "$products.quantity",
                    "$products.info.costPrice",
                  ],
                },
              ],
            },
          },
          name: { $first: "$products.name" },
          category: {
            $first: "$products.info.info.category",
          },
          brand: {
            $first: "$products.info.info.brand",
          },
          photo: { $first: "$products.image" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 3 },
    ]);

    if (!popularProductStats) throw '401';
    if (controller) return popularProductStats;
    return res.status(200).json(popularProductStats);

  } catch (err) {
    return res.status(401).send();
  }
}

async function fetchCategorySalesData(req, res) {
  let controller = req.controller ? true : false;
  try {
    const categoryStats = await orders.aggregate([
      {
        $match: {
          payment_status: "success",
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.sku",
          foreignField: "sku",
          as: "products.info",
        },
      },
      {
        $unwind: {
          path: "$products.info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$products.info.info.category",
          sales: {
            $sum: {
              $multiply: [
                "$products.price",
                "$products.quantity",
              ],
            },
          },
        },
      },
      {
        $sort: {
          sales: -1,
        },
      },
      {
        $limit: 3
      }
    ]);
    if (!categoryStats) throw '401'; // throw error if aggregationPipe Fails
    if (controller) return categoryStats; // return calculated data if it arrives from controller

    return res.status(200).json({ 'categoryStats': categoryStats });
  } catch (err) {
  }
}

async function fetchReviewStats(req, res) {
  let sellerData = req.tokenData;
  let controller = req.controller ? true : false;
  
  try {
    let aggregationPipe = [

      { $unwind: '$reviews' },
      {
        $group: {
          _id: null,
          satisfied: {
            $sum: { $cond: [{ $gte: ['$reviews.rating', 4] }, 1, 0] }
          },
          neutral: {
            $sum: { $cond: [{ $eq: ['$reviews.rating', 3] }, 1, 0] }
          },
          unsatisfied: {
            $sum: { $cond: [{ $lte: ['$reviews.rating', 2] }, 1, 0] }
          }
        }
      },
      {
        $project: { _id: 0 }
      }
    ];

    if (sellerData.role == 'seller') {

      aggregationPipe.unshift({ $match: { 'productInfo.sellerID': sellerData.id } });
      aggregationPipe.unshift({
        $lookup: {
          from: 'products',
          localField: 'productID',
          foreignField: '_id',
          as: 'productInfo'
        }
      });
    }
    const ratingOverView = await reviews.aggregate(aggregationPipe);

    if (!ratingOverView) throw '401'; // throw error if aggregationPipe Fails
    if (controller) return ratingOverView[0]; // return calculated data if it arrives from controller
    res.status(200).json(ratingOverView[0]);

  } catch (err) {
    res.status(401).send();
  }
}

async function addProduct(req, res) {
  const sellerID = req.tokenData.id;
  const productObject = req.body;

  try {
    let response;

    if (productObject.type == 'bulk') {
      let data = productObject.data;

      let seller_info = await sellerInfo.findOne({ sellerID: sellerID });

      data.forEach((product) => {
        if (!seller_info['categories'].includes(product.info.category.toLowerCase())) {
          seller_info['categories'].push(product.info.category);
        }

        if (!seller_info['brands'].includes(product.info.brand)) {
          seller_info['brands'].push(product.info.brand);
        }
        product.info.tags.forEach((tag) => {
          if (!seller_info['tags'].includes(tag.toLowerCase())) {
            seller_info['tags'].push(tag);
          }
        });
      })

      await sellerInfo.updateOne({ sellerID: sellerID }, { $set: seller_info });

      for (const product of data) {
        // Add the sellerID for each product
        product['sellerID'] = sellerID;

        // Generate SKU for the product
        product['sku'] = await SKU_generater.generateSKU(product);

        response = await products.create(product);
      }

    } else {
      Object.keys(productObject.data.basicinfo).forEach((key) => {
        productObject.data[key] = productObject.data.basicinfo[key];
      });
      productObject.data.sellerID = sellerID;
      productObject.data.sku = await SKU_generater.generateSKU(productObject.data);
      response = await products.create(productObject.data);
    }

    if (!response) throw "Not Uploaded"
    return res.status(200).json("uploaded");

  } catch (err) {
    return res.status(401).json(err);
  }
}

async function updateHighlightProduct(req, res) {
  const sellerID = req.tokenData.id;
  const highlight = req.body;
  try {
    const response = await products.updateOne(
      {
        '_id': new ObjectId(highlight._id),
        'sellerID': sellerID
      },
      {
        $set: { 'highlight': highlight.status }
      });

    const highlightCount = await products.find({ 'highlight': true }).count();

    if (!response) throw "Unable to Update";
    return res.status(200).json({ 'highlightCount': highlightCount });

  } catch (err) {
    return res.status(401).send();
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

    const response = await products.findOneAndUpdate({
      '_id': _id,
      'sellerID': sellerID
    }, { $set: productObject.data });

    // SKU_generater.generateSKU(productObject.data);

    return res.status(200).json("uploaded");
  } catch (err) {
  }
}

async function deleteProductInventory(req, res) {
  const sellerID = req.tokenData.id;
  const reqData = req.body;

  try {
    let response;

    if (Array.isArray(reqData.data)) {
      response = await products.updateMany({ 'sellerID': sellerID, _id: { $in: reqData.data } }, { $set: { 'active': false } });
      return res.status(200).json({ message: 'Products Deleted' })
    }

    response = await products.updateOne({ 'sellerID': sellerID, _id: reqData.data }, { $set: { 'active': false } });

    if (!response) throw "Unable to Delete";

    return res.status(200).json({ message: 'Products Deleted' })
  } catch (err) {
    return res.status(409).json({ message: 'Products not Deleted' })
  }
}

// Fetch All Products specific to seller/Admin
async function fetchProductInventory(req, res) {
  const sellerID = req.tokenData.id;
  const parameters = req.body;
  try {
    aggregationPipe = [
      {
        $match: {
          $or: [
            { 'name': { $regex: parameters.filter['search'], $options: 'i' } },
            { 'info.category': { $regex: parameters.filter['search'], $options: 'i' } },
            { 'info.brand': { $regex: parameters.filter['search'], $options: 'i' } }
          ]
        }
      },
      {
        $facet: {
          data: [

            { $unwind: "$assets" },
            { $unwind: "$assets.stockQuantity" },
            {
              $group: {
                _id: "$_id",
                inventory: {
                  $sum: "$assets.stockQuantity.quantity"
                },
                unitSold: {
                  $sum: { $cond: [{ $lte: ["$assets.stockQuantity.unitSold", 0] }, 0, "$assets.stockQuantity.unitSold"] },
                }
              }
            },
            {
              $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "productID",
                as: "rating",
              }
            },
            {
              $unwind: {
                path: "$rating",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $unwind: {
                path: "$rating.reviews",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $group: {
                _id: "$_id",
                avgRating: {
                  $avg: {
                    $ifNull: ["$rating.reviews.rating", 0]
                  }
                },
                inventory: { $first: "$$ROOT.inventory" },
                unitSold: { $first: "$$ROOT.unitSold" },
              }
            },
          ],
          pageInfo: [
            {
              $group:
              {
                _id: null,
                highlightCount: { $sum: { $cond: [{ $eq: ['$highlight', true] }, 1, 0] } },
                count: { $sum: 1 },
              }
            },
          ],
        }
      }
    ];

    let sortFilter = false;
    Object.keys(parameters.filter).forEach((key) => {
      if (parameters.filter[key]) {
        if (key == 'categories') {
          aggregationPipe.unshift({ $match: { 'info.category': { $regex: parameters.filter['categories'], $options: 'i' } } });
        }
        if (key == 'rating') {
          aggregationPipe[aggregationPipe.length - 1].$facet.data.push({ $sort: { 'avgRating': parameters.filter[key] } });
          sortFilter = true;
        }
        else if (key == 'stockQuantity') {
          aggregationPipe[aggregationPipe.length - 1].$facet.data.push({ $sort: { 'inventory': parameters.filter[key] } });
          sortFilter = true;
        }
      }
    });

    aggregationPipe.unshift({ $match: { 'sellerID': new ObjectId(sellerID), 'active': true } });

    aggregationPipe[aggregationPipe.length - 1].$facet.data.push(
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: "productInfo"
        }
      },
      {
        $unwind: '$productInfo'
      }
    );

    if (!sortFilter) {
      aggregationPipe[aggregationPipe.length - 1].$facet.data.push(
        {
          $sort: { 'productInfo.name': 1 }
        }
      );
    }

    aggregationPipe[aggregationPipe.length - 1].$facet.data.push(
      { $skip: (parameters.page - 1) * parameters.limit },
      { $limit: parameters.limit }
    );
    let response = JSON.parse(JSON.stringify(await products.aggregate(aggregationPipe)));

    res.status(200).json(response[0]);

  } catch (err) {
  }
}

//Extract all detail of products using SQU
async function fetchProductDetail(req, res) {
  let sku = req.query.data;
  delete req.query.data;

  try {
    let response = await productController.fetchProductDetails(req, res, sku, true);
    return res.status(200).json(response);

  } catch (err) {
    return res.status(404).json({ message: err });
  }
}

async function fetchFeatures(req, res) {
  const sellerID = req.tokenData.id;
  const data = req.body;
  try {
    let response;
    let query = {};
    data.forEach((field) => {
      query[field] = 1
    });

    if (sellerID)
      response = await sellerInfo.findOne({ 'sellerID': sellerID }, query);
    else
      response = await sellerInfo.findOne({}, query);

    if (response) {
      return res.status(200).json(response);
    }
    throw "404";
  } catch (err) {
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
    return res.status(404).send();
  }
}

async function updateDetails(req, res) {

  const userToken = req.body.data.info.token;
  // const payload = JSON.parse(atob(userToken.split('.')[1]));
  const id = req.tokenData.id;

  const emails = await users.findOne({ _id: req.tokenData.id }, { email: 1, _id: 0 });
  const email = emails.email
  const role = req.tokenData.role;
  const data = req.body.data;

  if (data && role == 'admin' && email && data.name && data.name.firstname !== undefined) {
    const firstname = data.name.firstname;

    try {
      const response = await users.updateOne(
        { '_id': id, 'role': role },
        {
          $set: {
            email: email,
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
  const id = req.tokenData.id;

  try {
    const response = await users.find({ role: 'admin', _id: id });
    if (response) {
      return res.status(200).json(response);
    }
    throw "404";
  } catch (err) {
    return res.status(404).send();
  }
}

// async function createOffer(req, res) {
//     try {
//         const offer = await OffersModel(req.body);
//         await offer.save();
//         res.status(200).json(offer);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }



// async function getOffers(req, res) {
//   try {

//         const data = await OffersModel.find({'status.deleted':false});
//         res.status(200).json(data);
//     } catch (error) {
//         res.status(500).json(error);
//     }
// }


// async function deleteOffer(req, res) {
//   try {
//     const offerdeleted = await OffersModel.updateOne({ _id: req.body.id }, { $set: { "status.deleted": true } });
//     res.status(200).json({ message: 'Deleted Successfully' });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// }


async function updateFaq(req, res) {
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
    console.error(err, "error");
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
    const result = await faqData.findOneAndUpdate(
      { 'childrens._id': itemId },
      {
        $pull: {
          childrens: { _id: itemId },
        },
      },
      { new: true }
    );
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting the FAQ item' });
  }
}

async function getPaymentKeys(req, res) {
  try {
    const paymentKeys = await PaymentKeys.find({}).populate('keys.adminId');
    res.status(200).json(paymentKeys);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json(error);
  }
}



// async function updateOffer(req, res) {
//   try {
//     const result = await OffersModel.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
//     res.status(200).json({ message: 'updated Successfully' });
//   } catch (error) {
//     res.status(500).json(error);
//   }
// }


async function addPaymentKeys(req, res) {
  try {
    const { publicKey, privateKey } = req.body;
    // const decodedPayload = atob(req.body.adminId);
    const admin = JSON.parse(decodedPayload);
    const adminId = admin.id;

    let adminKeys = await PaymentKeys.findOne({});

    if (!adminKeys) {
      adminKeys = new PaymentKeys({
        keys: [{ adminId, publicKey, privateKey }]
      });
    } else {
      adminKeys.keys.push({ adminId, publicKey, privateKey });
    }

    await adminKeys.save();
    res.status(200).json({ message: 'Payment Keys added Successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function updatePaymentKeys(req, res) {
  try {
    const { publicKey, privateKey, id, enable } = req.body;
    const adminId = id;

    const adminKeys = await PaymentKeys.findOneAndUpdate(
      { 'keys._id': adminId },
      { $set: { 'keys.$.publicKey': publicKey, 'keys.$.privateKey': privateKey, 'keys.$.enable': enable } }, // Update the fields
      { new: true }
    );

    res.status(200).json({ message: 'Payment Keys updated Successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function deletePaymentKeys(req, res) {
  const { id } = req.body;
  const data = await PaymentKeys.deleteOne({ 'keys._id': id });
  res.status(200).json({ message: 'Payment Keys deleted Successfully' });
}

async function getPaginatedData(req, res) {
  const modelName = req.params.model;
  const page = parseInt(req.query.page, 1) || 1;
  const pageSize = parseInt(req.query.pageSize, 3) || 10;

  try {
    const Model = require(`../models/${modelName}`);
    const data = await paginateResults(Model, page, pageSize);

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  // Stats Data
  getOverallInfo,
  fetchCategorySalesData,
  fetchProductSalesData,
  fetchReviewStats,
  fetchPopularProducts,

  addProduct,
  updateProduct,
  updateHighlightProduct,
  deleteProductInventory,
  fetchProductInventory,
  fetchProductDetail,
  fetchFeatures,
  updateFeatures,
  updateDetails,
  getAdminDetails,
  // createOffer,
  // getOffers,
  // deleteOffer,
  // getProductPrice,
  updateFaq,
  deleteFaq,
  addFaq,
  // updateOffer
  // getProductPrice
  // updateOffer,
  // getProductPrice,
  addPaymentKeys,
  getPaymentKeys,
  updatePaymentKeys,
  deletePaymentKeys,
  getPaginatedData,
}

