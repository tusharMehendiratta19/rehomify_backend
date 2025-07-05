const mongoose = require('mongoose');

const resellOrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  orderDate: Date,
  deliveryDate: Date,
  status: { type: String, enum: ['requested', 'confirmed', 'rejected'], default: 'requested' }
}, { timestamps: true });

module.exports = mongoose.model('ResellOrder', resellOrderSchema);
