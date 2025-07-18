const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
