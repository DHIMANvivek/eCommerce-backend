const faqData = require('./../../models/custom-website-elements/faq');

async function getFaq(req , res) {
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
}

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
  

module.exports = {
    getFaq,
    addFaq,
    updateFaq,
    deleteFaq
}