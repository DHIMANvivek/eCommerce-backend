const { set } = require('../../models/address');
const faqData = require('./../../models/custom-website-elements/faq');

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
    console.log(err);
    return res.status(404).send();
  }
}*/

/* getFaq with aggregation */
async function getFaq(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

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
    console.log(err);
    return res.status(404).send();
  }
}

/* update Faq without Aggregation */
async function updateFaq(req, res) {
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
async function addFaq(req, res) {
  try {
    const { title, children } = req.body;

    const result = await faqData.aggregate([
      { $match: { title: title } },
      {
        $project: {
          childrens: {
            $concatArrays: ["$childrens", children]
          }
        }
      }
    ]);

    if (!result.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updateResult = await faqData.updateOne({ title: title }, { $set: { childrens: result[0].childrens } });

    if (updateResult.nModified > 0) {
      return res.status(200).json({ success: true, message: 'Children added to the category' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to add children to the category' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'An error occurred while adding children to the category' });
  }
}

/* Delete Query Without Aggregation */
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


module.exports = {
  getFaq,
  addFaq,
  updateFaq,
  deleteFaq
}