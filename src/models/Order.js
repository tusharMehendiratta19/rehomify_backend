const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // sellerId for each product
  isNewProduct: { type: Boolean, default: true },
  isRefurbished: { type: Boolean, default: false },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  invoiceUrl: { type: String },
  status: {
    type: String,
    enum: ['placed', "Rejected", "Processing", "Shipped", "Delivered"],
    default: 'placed'
  },
  paymentDetails: { type: Object },
  paymentStatus: { type: String },
  isResellRequested: { type: Boolean, default: false },
  resellOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResellOrder' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
