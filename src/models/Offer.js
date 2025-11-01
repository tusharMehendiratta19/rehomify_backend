const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  type: { type: String, required: true },
  id: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  image:{ type: String },
  amount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  isActive: { type: Boolean, required: true, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
