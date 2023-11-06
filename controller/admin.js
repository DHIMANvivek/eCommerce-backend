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
const Title = require('../models/support-ticket/createTicket');
const SKU_generater = require('../helpers/sku');
// const PaymentKeys = require('../models/paymentKeys');
// const paginateResults = require('../helpers/pagination');

const productController = require('../controller/products');

const OffersModel = require('../models/offers');

async function fetchProductSalesData(req, res, type = '') {

  const data = req.tokenData;

  try {
    if (data.role == 'admin') {

      await orders.aggregate([
        // {
        //   $match: {"payment_status": 'success'}
        // },
        {
          $unwind: '$products'
        },
        {
          $lookup: {
            from: 'products',
            localField: 'products._id',
            foreignField: '_id',
            as: 'info'
          }
        },
        {
          $project: {
            year: { $year: '$orderTime' },
            month: { $month: '$orderTime' },
            'products': 1,
            'discount': 1
          }
        }
      ]);

    }

  } catch (err) {

  }

  // const productInfo = await products.aggregate([
  //   {
  //     $unwind: {
  //       path: '$assets',
  //       includeArrayIndex: 'string',
  //       preserveNullAndEmptyArrays: true
  //     }
  //   },
  //   {
  //     $unwind: {
  //       path: '$assets.stockQuantity',
  //       includeArrayIndex: 'string',
  //       preserveNullAndEmptyArrays: true
  //     }
  //   },
  //   {

  //     $facet: {
  //       sales_profit:
  //         [{
  //           $group: {
  //             _id: '$_id',
  //             qtySold: {
  //               $sum: '$assets.stockQuantity.unitSold'
  //             },
  //             CP: { $first: '$$ROOT.costPrice' },
  //             SP: { $first: '$$ROOT.price' },
  //             alertCount: {
  //               $sum: {
  //                 $cond: [
  //                   {
  //                     $lt: [
  //                       {
  //                         $subtract: [
  //                           "$assets.stockQuantity.quantity",
  //                           "$assets.stockQuantity.unitSold",
  //                         ],
  //                       },
  //                       { $arrayElemAt: ["$$ROOT.info.orderQuantity", 0] },
  //                     ],
  //                   }, 1, 0],
  //               }
  //             }
  //           }
  //         },
  //       ],
  //       category_sales_profit: [
  //         {
  //           $group: {
  //             _id: "$info.category",
  //             sales: {
  //               $sum: {
  //                 $multiply: ['$price', '$assets.stockQuantity.unitSold']
  //               }
  //             }
  //           }
  //         }
  //       ]
  //     },
  //   }
  // ]);

}

async function getOverallInfo(req, res) {
  try {

    let result = {};

    const ratingOverView = await reviews.aggregate([
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
    ]);

    result['customer_review'] = ratingOverView[0];

    const customer_count = await users.find({ 'role': { $not: { $eq: 'admin' } } }).count();
    result['customer'] = customer_count;

    const order_count = await orders.find({}).count();
    result['orders'] = order_count;

    const discount = await orders.aggregate([
      {
        $group: {
          _id: null,
          discount: {
            $sum: '$discount'
          }
        }
      },
      {
        $project: { _id: 0 }
      }
    ]);
    result['totalDiscount'] = discount;

    const productInfo = await products.aggregate([
      {
        $unwind: {
          path: '$assets',
          includeArrayIndex: 'string',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$assets.stockQuantity',
          includeArrayIndex: 'string',
          preserveNullAndEmptyArrays: true
        }
      },
      {

        $facet: {
          sales_profit:
            [{
              $group: {
                _id: '$_id',
                qtySold: {
                  $sum: '$assets.stockQuantity.unitSold'
                },
                CP: { $first: '$$ROOT.costPrice' },
                SP: { $first: '$$ROOT.price' },
                alertCount: {
                  $sum: {
                    $cond: [
                      {
                        $lt: [
                          {
                            $subtract: [
                              "$assets.stockQuantity.quantity",
                              "$assets.stockQuantity.unitSold",
                            ],
                          },
                          { $arrayElemAt: ["$$ROOT.info.orderQuantity", 0] },
                        ],
                      }, 1, 0],
                  }
                }
              }
            },
            ],
          category_sales_profit: [
            {
              $group: {
                _id: "$info.category",
                sales: {
                  $sum: {
                    $multiply: ['$price', '$assets.stockQuantity.unitSold']
                  }
                }
              }
            }
          ]
        },
      }
    ]);
    result['productInfo'] = productInfo;
    res.status(200).json(result);

  } catch (err) {

  }
}

async function addProduct(req, res) {
  const sellerID = req.tokenData.id;
  const productObject = req.body;

  try {
    let response;

    if (productObject.type == 'bulk') {
      let data = productObject.data;

      data = await Promise.all(data.map(async (product) => {
        product['sellerID'] = sellerID;
        product['sku'] = await SKU_generater.generateSKU(product);
        return product;
      }));
      response = await products.insertMany(productObject.data);
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
    console.log(err);
    return res.status(401).json(err);

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

    console.log("response:: ", response);
    return res.status(200).json("uploaded");
  } catch (err) {
    console.log(err);
  }
}

async function deleteProductInventory(req, res) {
  console.log(req.body);
  const sellerID = req.tokenData.id;
  const reqData = req.body;

  try {
    let response;

    if (Array.isArray(reqData.data)) {
      response = await products.updateMany({ 'sellerID': sellerID, _id: { $in: reqData.data } }, { $set: { 'active': false } });
      return res.status(200).json({ message: 'Products Deleted' })
    }

    response = await products.updateOne({ 'sellerID': sellerID, _id: reqData.data }, { $set: { 'active': false } });

    console.log(response);
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
                  $sum: {
                    $subtract: [
                      "$assets.stockQuantity.quantity",
                      "$assets.stockQuantity.unitSold",
                    ],
                  },
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
            }
          ],
          pageInfo: [
            {
              $group:
              {
                _id: null,
                count: { $sum: 1 },
              }
            },
          ],
        }
      }
    ];


    Object.keys(parameters.filter).forEach((key) => {
      if (parameters.filter[key]) {

        if (key == 'categories') {
          console.log("Hello");
          aggregationPipe.unshift({ $match: { 'info.category': { $regex: parameters.filter['categories'], $options: 'i' } } });
        }

        if (key == 'rating') {
          aggregationPipe[aggregationPipe.length - 1].$facet.data.push({ $sort: { 'avgRating': parameters.filter[key] } });
        }
        else if (key == 'stockQuantity') {
          aggregationPipe[aggregationPipe.length - 1].$facet.data.push({ $sort: { 'inventory': parameters.filter[key] } });
        }
      }
    });


    aggregationPipe.unshift({ $match: { 'sellerID': new ObjectId(sellerID), 'active': true } });
    aggregationPipe[aggregationPipe.length - 1].$facet.data.push(
      { $skip: (parameters.page - 1) * parameters.limit },
      { $limit: parameters.limit }
    );

    let response = JSON.parse(JSON.stringify(await products.aggregate(aggregationPipe)));

    // Fetching Product Details after Aggreagtion operation -> unwind using _id 
    response[0].data = await Promise.all(response[0].data.map(async (data) => {
      data.productInfo = await products.findOne({ _id: data._id });
      return data;
    }));

    res.status(200).json(response[0]);
  } catch (err) {
    console.log(err);
  }
}

//Extract all detail of products using SQU
async function fetchProductDetail(req, res) {
  let sku = req.query.data;
  delete req.query.data;

  try {
    let response = await productController.fetchProductDetails(req, res, sku, true);
    console.log(response);
    return res.status(200).json(response);

  } catch (err) {
    console.log(err);
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
  console.log(userToken, "userToken")
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

// async function createOffer(req, res) {
//     try {
//         const offer = await OffersModel(req.body);
//         await offer.save();
//         res.status(200).json(offer);
//     } catch (error) {
//       console.log('error is ',error);
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

async function setTicketTitle(req, res) {
  try {
    const titlesToAdd = ["Security Related Issue", "Product Pricing Issue", "Others"];
    const childDocument = { title };
    const ticket = new Ticket({
      ticketTitle: 'Sample Ticket',
      userName: 'User Name',
      userEmail: 'user@example.com',
      status: 'Pending',
      action: 'View Message',
      ticketType: [childDocument],
    });
    await ticket.save();

    return res.status(201).json({ message: 'Titles added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error adding titles' });
  }
}

async function createTicketTitle(req, res) {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTitle = new Title({ title });
    await newTitle.save();

    return res.status(201).json({ message: 'Title created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error creating title' });
  }
}

async function addTitleToTicketType(req, res) {
  try {
    const { _id, newTitle } = req.body;

    if (!newTitle) {
      return res.status(400).json({ error: 'New title is required' });
    }

    //   const defaultStatusValues = [
    //     'pending',
    //     'open',
    //     'rejected',
    //     'resolved',
    //     'closed',
    //     'cancelled',
    //     'in-progress',
    //   ];

    const result = await Title.findByIdAndUpdate(
      _id,
      {
        $push: {
          title: newTitle,
          // status: { $each: defaultStatusValues } 
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error adding title' });
  }
}


async function updateTicketTitle(req, res) {
  try {
    const { oldTitle, newTitle, _id } = req.body;

    if (!oldTitle || !newTitle) {
      return res.status(400).json({ error: 'Both oldTitle and newTitle are required' });
    }

    const result = await Title.findOneAndUpdate(
      {
        'title': oldTitle,
      },
      {
        $set: {
          'title.$': newTitle,
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Title not found' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error updating title' });
  }
}

async function deleteTicketTitle(req, res) {
  try {
    const { _id, title } = req.body;

    console.log(_id, title)

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    //   const ticketTypeId = '6534ab7f7033d7d5a6f71b22'; 
    const result = await Title.findByIdAndUpdate(
      _id,
      { $pull: { title: title } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Title not found' });
    }

    return res.status(200).json({ message: 'Title deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting title' });
  }
}

async function getAllTicket(req, res) {
  try {
    const response = await Ticket.find({})
      .populate({
        path: 'ticketType.title',
      })
      .populate({
        path: 'notificationDetails'
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



async function updateTicketStatus(req, res) {
  try {
    const { _id, status } = req.body;
    console.log(_id, status)
    const result = await Ticket.findByIdAndUpdate(
      _id,
      { $set: { status: status } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.status(200).json({ message: 'Ticket status updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error updating ticket status' });
  }
}

async function deleteSupportTicket(req, res) {
  try {
    const { _id } = req.body;
    console.log(_id)
    const result = await Ticket.findByIdAndDelete(_id);

    if (!result) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error deleting ticket' });
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
//     console.log('req   body is ', req.body);
//     const result = await OffersModel.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
//     console.log('update offer is ', result);
//     res.status(200).json({ message: 'updated Successfully' });
//   } catch (error) {
//     console.log('error is ', error);
//     res.status(500).json(error);
//   }
// }


async function addPaymentKeys(req, res) {
  try {
    const { publicKey, privateKey } = req.body;
    const decodedPayload = atob(req.body.adminId);
    const admin = JSON.parse(decodedPayload);
    const adminId = admin.id;
    console.log(adminId, "admin Id Is");

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
    console.log('error is ', error);
    res.status(500).json(error);
  }
}

async function updatePaymentKeys(req, res) {
  try {
    const { publicKey, privateKey, id, enable } = req.body;
    const adminId = id;
    console.log(adminId, privateKey, publicKey, id, enable, "admin Id Is");

    const adminKeys = await PaymentKeys.findOneAndUpdate(
      { 'keys._id': adminId },
      { $set: { 'keys.$.publicKey': publicKey, 'keys.$.privateKey': privateKey, 'keys.$.enable': enable } }, // Update the fields
      { new: true }
    )
      .then(updatedKeys => {
        console.log(updatedKeys);
      })
      .catch(err => {
        console.error(err);
      });
    if (adminKeys) {
      console.log('Document Updated:', adminKeys);
    } else {
      console.log('No matching document found for the given query.');
    }
    res.status(200).json({ message: 'Payment Keys updated Successfully' });
  } catch (error) {
    console.log('error is ', error);
    res.status(500).json(error);
  }
}

async function deletePaymentKeys(req, res) {
  const { id } = req.body;
  console.log(id);
  const data = await PaymentKeys.deleteOne({ 'keys._id': id });
  console.log(data);
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
  getOverallInfo,
  addProduct,
  updateProduct,
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
  setTicketTitle,
  createTicketTitle,
  updateTicketTitle,
  addTitleToTicketType,
  deleteTicketTitle,
  getAllTicket,
  updateTicketStatus,
  deleteSupportTicket,
  // updateOffer
  // getProductPrice
  // updateOffer,
  // getProductPrice,
  addPaymentKeys,
  getPaymentKeys,
  updatePaymentKeys,
  deletePaymentKeys,
  getPaginatedData
}

