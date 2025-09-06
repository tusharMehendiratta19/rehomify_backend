const mongoose = require('mongoose');

const CustomerproductSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  name: String,
  description: String,
  price: Number,
  image: String,
  optionalImages: [String],
  sellerId: String,
  isNewProduct: Boolean,
  isRefurbished: Boolean,
  suggestion: Boolean,
  width: Number,
  height: Number,
  length: Number,
  color: String,
  colorCode: String,
  woodMaterial: String,
}, { timestamps: true });

module.exports = mongoose.model('CustomerProduct', CustomerproductSchema);
