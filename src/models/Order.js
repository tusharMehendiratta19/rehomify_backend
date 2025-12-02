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
    enum: ['placed', 'shipped', 'delivered', 'cancelled', "out for delivery"],
    default: 'placed'
  },
  paymentDetails: { type: Object },
  paymentStatus: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
