const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  mobileNo: { type: String, unique: true, sparse: true },
  password: String,
  type: { type: String, enum: ['customer', 'seller', 'admin'] },
  city: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
