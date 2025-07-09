const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    city: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'sellers', // explicitly sets the collection name
  }
);

module.exports = mongoose.model('Seller', sellerSchema);
