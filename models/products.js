const mongoose = required('mongoose');

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
    photo: [{
      type: String,
      min: 3, 
      required: true
    }]
  }],

  info: {
    code: {
      type: String,
      trim: true
    },
    category: [{
      type: String,
      required: true
    }],
    gender: {
      type: String,
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
  discount: {
    type: Number,
    default: 0
  },

  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
  },

  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    comment: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
},
  {
    timestamps: true,
    autoIndex: true
  }
);


module.exports = mongoose.model('products', productSchema);