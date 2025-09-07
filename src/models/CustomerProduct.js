const mongoose = require('mongoose');

const CustomerproductSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    emailid: String,
    mobileNo: String,
    productName: String,
    category: String,
    description: String,
    addressline1: String,
    addressline2: String,
    pincode: String,
    landmark: String,
    price: Number,
    image: String,
    cpImagesUrls: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomerProduct', CustomerproductSchema);
