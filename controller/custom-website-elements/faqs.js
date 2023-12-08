const { set } = require('../../models/address');
const faqData = require('./../../models/custom-website-elements/faq');
const logger = require('./../../logger');
const faqModel = require('../../models/custom-website-elements/faq');

/* getFaq without aggregation 
async function getFaq(req, res) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 2;

    const skip = (page - 1) * limit;

    const response = await faqData.find({}).skip(skip).limit(limit);
    if (response) {
      return res.status(200).json(response);
    }
    throw "404";
  } catch (err) {
    return res.status(404).send();
  }
}*/

/* getFaq with aggregation */
async function getFaq(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];

    const response = await faqData.aggregate(pipeline).exec();

    if (response && response.length > 0) {
      return res.status(200).json(response);
    }
    throw "404";
  } catch (err) {
        logger.error(err);
    return res.status(404).send();
  }
}

/* update Faq without Aggregation */
async function updateFaq(req, res) {
  console.log(req.body, "req.body")
  try {
    const { _id: itemId, title: updatedTitle, content: updatedContent } = req.body;

    const filter = { 'childrens._id': itemId };
    const update = { $set: { 'childrens.$.title': updatedTitle, 'childrens.$.content': updatedContent } };
    const options = { new: true };

    const updatedDocument = await faqData.findOneAndUpdate(filter, update, options);

    if (updatedDocument) {
      res.json(updatedDocument);
    } else {
      return res.status(404).json({ error: 'FAQ item not found' });
    }
  } catch (err) {
        logger.error(err);
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating the FAQ item' });
  }
}

/*  Add Faq  without Aggregation 
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
} */

/* Add Faq  with Aggregation */
// async function addFaq(req, res) {

//   try {
//     const { title, children } = req.body;

//     const result = await faqData.aggregate([
//       { $match: { title: title } },
//       {
//         $project: {
//           childrens: {
//             $concatArrays: ["$childrens", children]
//           }
//         }
//       }
//     ]);

//     console.log(result, "faq result");

//     if (!result.length) {
//       return res.status(404).json({ success: false, message: 'Category not found' });
//     }

//     const updateResult = await faqData.updateOne({ title: title }, { $set: { childrens: result[0].childrens } });

//     if (updateResult) {
//       return res.status(200).json({ success: true, message: 'Children added to the category' });
//     } else {
//       return res.status(500).json({ success: false, message: 'Failed to add children to the category' });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'An error occurred while adding children to the category' });
//   }
// }

// async function addFaq(req, res) {
//   try {
//     const categories = req.body.categories; // Array of categories to be updated

//     const categoryPromises = categories.map(async (category) => {
//       const { selectedOption, query, content } = category;

//       const result = await faqData.findOneAndUpdate(
//         { title: selectedOption },
//         {
//           $push: {
//             childrens: {
//               title: query,
//               content: content,
//               expanded: false,
//             },
//           },
//         },
//         { new: true }
//       );

//       return result;
//     });

//     const updatedCategories = await Promise.all(categoryPromises);

//     const allUpdatesSuccessful = updatedCategories.every((category) => !!category);

//     if (allUpdatesSuccessful) {
//       return res.status(200).json({ success: true, message: 'Children added to the categories' });
//     } else {
//       return res.status(500).json({ success: false, message: 'Failed to add children to some categories' });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'An error occurred while adding children to the categories' });
//   }
// }


async function addFaq(req, res) {
  try {
    const categories = req.body.categories;
    const categoryPromises = categories.map(async (category) => {
      const { title, children } = category;

      const existingCategory = await faqData.findOne({ title });

      if (existingCategory) {
        const result = await faqData.findOneAndUpdate(
          { title },
          {
            $push: {
              childrens: { $each: children },
            },
          },
          { new: true }
        );

        return result;
      } else {
        const newCategory = new faqData({
          title,
          childrens: children,
        });

        const result = await newCategory.save();
        return result;
      }
    });

    const updatedCategories = await Promise.all(categoryPromises);

    const allUpdatesSuccessful = updatedCategories.every((category) => !!category);

    if (allUpdatesSuccessful) {
      return res.status(200).json({ success: true, message: 'Categories and children added/updated successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to add/update some categories or children' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'An error occurred while adding/updating categories and children' });
  }
}



/* Delete Query Without Aggregation */
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
        logger.error(err);
    
    res.status(500).json({ error: 'An error occurred while deleting the FAQ item' });
  }
}


module.exports = {
  getFaq,
  addFaq,
  updateFaq,
  deleteFaq,
}