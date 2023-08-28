const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
  sku: { type: String, required: true, },
  name: { type: String, required: true, },
  price: { type: Number, required: true, default: 0, min: 0, },
  oldPrice: { type: Number, default: 0, min: 0, },
  image: [String],
  sizes: [String],
  colors: [String],
  description: { type: String },
  stockQuantity: { type: Number, required: true, min: 0, },
  orderQuantity: [Number],
  info: { productCode: String, category: String, subTitle: String, brand: String, weight: String, composition: String, tags: [String], },
  available: { type: Boolean, default: true, },
  reviews: [{
    username: String, rating: { type: Number, min: 0, max: 5, },
    comment: String, date: Date,
  }],
  sellerID: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, },
},
  { timestamps: true, autoIndex: true });
module.exports = mongoose.model('Product', productSchema);