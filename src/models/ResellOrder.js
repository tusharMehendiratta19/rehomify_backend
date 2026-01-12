const mongoose = require('mongoose');

const resellOrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderDate: Date,
  deliveryDate: Date,
  productDetails: {
    category: String,
    name: String,
    description: String,
    price: Number,
    imageUrl: String
  },
  status: { type: String, enum: ['Requested', 'Accepted', 'Rejected', 'Completed', 'Cancelled'], default: 'Requested' }
}, { timestamps: true });

module.exports = mongoose.model('ResellOrder', resellOrderSchema);
