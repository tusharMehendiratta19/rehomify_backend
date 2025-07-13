const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  status: { type: Boolean, required: true, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
