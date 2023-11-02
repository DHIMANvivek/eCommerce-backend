const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  expanded: {
    type: Boolean,
    default: false,
  },
});

const faqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  childrens: [childSchema], 
  expanded: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('faqdatas', faqSchema);
