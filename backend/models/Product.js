const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  costPrice: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  supplierProductId: {
    type: String
  },
  ratings: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  },
  reviews: [reviewSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  video: {
    type: String
  },
  variants: [{
    sku: { type: String, required: true },
    color: String,
    size: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
