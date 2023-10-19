const mongoose = require('mongoose');

const productSchema = mongoose.Schema({

  sellerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  assets: [{
    color: {
      type: String,
      required: true
    },
    stockQuantity: [{
      size: {
        type: String,
        unique: true,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        required: true
      },
      quantity: {
        type: Number,
        default: 0,
        required: true
      },
      unitSold: {
        type: Number,
        default: 0
      }
    }],
    photo: [{
      type: String,
      min: 2, 
      required: true
    }]
  }],
  info: {
    code: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      lowercase: true, 
      enum: ['male', 'female', 'unisex'],
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    composition: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
      required: true
    }],
    orderQuantity: [{
      type: Number,
      required: true,
    }],
  },
  price: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  active: {
    type: Boolean,
    default: true
  }
},
  {
    timestamps: true,
    autoIndex: true
  }
);


module.exports = mongoose.model('products', productSchema);