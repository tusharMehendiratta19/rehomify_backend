const Wishlist = require('../models/Wishlist');

exports.getWishlistItems = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) return res.status(200).json([]);

    const items = wishlist.products.map(p => ({
      id: p._id,
      category: p.category,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl
    }));

    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
