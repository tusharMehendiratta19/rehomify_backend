const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customerName: String,
  imageUrl: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
