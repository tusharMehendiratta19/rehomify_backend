const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],
  orderDate: Date,
  deliveryDate: Date,
  status: { type: String, enum: ['placed', 'shipped', 'delivered'], default: 'placed' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
