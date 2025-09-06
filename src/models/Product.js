const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  width: Number,
  height: Number,
  length: Number,
  color: String,
  woodMaterial: String,
  colorCode: String,
  varieties: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
