const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  discountPercentage: { type: Number, required: true },
  validTill: { type: Date, required: true }
});

module.exports = mongoose.model('Offer', offerSchema);
