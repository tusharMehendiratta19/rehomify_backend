const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  name: String,
  description: String,
  price: Number,
  image: String,
  details: Object,
  sellerId: String,
  isNewProduct: Boolean,
  isRefurbished: Boolean,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
