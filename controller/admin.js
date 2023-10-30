const users = require('../models/users');
const products = require('../models/products');
const sellerInfo = require('../models/sellerDetails');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const faqData = require('../models/faq');
const Ticket = require('../models/supportTicket');
const Title = require('../models/createTicket');

const productController = require('../controller/products');

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

    // var received = productObject.data;

    console.log("dataREcieved:: ", productObject.data.assets[0].stockQuantity, _id);

    const response = await products.findOneAndUpdate({
      '_id': _id,

      'sellerID': sellerID
    }, { $set: productObject.data });

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
    // console.log(reqData.data.map((productID)=>{
    //     return products.updateOne({'sellerID': sellerID, '_id': productID}, {$set: {'active': false}});
    // }));
    let response;
    if (Array.isArray(reqData.data)) {
      response = await products.updateMany({ 'sellerID': sellerID, _id: { $in: reqData.data } }, { $set: { 'active': false } });
    }
    response = await products.updateOne({ 'sellerID': sellerID, _id: reqData.data }, { $set: { 'active': false } });

    // const response = await Promise.all(reqData.data.map((productID)=>{
    //     return products.updateOne({'sellerID': sellerID, '_id': productID}, {$set: {'active': false}});
    // }));
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
            {
              $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "productID",
                as: "reviews",
              },
            },
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
                  $sum: "$assets.stockQuantity.unitSold",
                },
                rating: { $first: "$$ROOT.reviews" },
              },
            },
            { $unwind: "$rating" },
            { $unwind: "$rating.reviews" },

            {
              $group: {
                _id: "$_id",
                avgRating: {
                  $avg: "$rating.reviews.rating",
                },
                inventory: { $first: "$$ROOT.inventory" },
                unitSold: { $first: "$$ROOT.unitSold" },
              },
            },
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
async function fetchProductDetail(req, res){
    let sku = req.query.data;
    delete req.query.data;

    try{
      let response = await productController.fetchProductDetails(req, res, sku, true);
      console.log(response);
      return res.status(200).json(response);

    }catch(err){
      console.log(err);
      return res.status(404).json({message: err});

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

    const response = await Ticket.find({}).populate([
      {
        path: 'ticketType.title',
      },
      {
        path: 'notificationDetails',
      }
    ]);
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

module.exports = {
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
}

