const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
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
    type: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        }
      }
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }
    ],
  },
  {
    timestamps: true,
    collection: 'customers',
  }
);

module.exports = mongoose.model('Customer', customerSchema);
