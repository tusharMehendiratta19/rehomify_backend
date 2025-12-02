const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  custId: String,
  orderId: String,
  rating: Number,
  review: String,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
