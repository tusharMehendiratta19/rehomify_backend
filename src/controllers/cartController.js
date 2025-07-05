const Cart = require('../models/Cart');

exports.getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('products.product');
    if (!cart) return res.status(200).json([]);

    const items = cart.products.map(p => ({
      id: p.product._id,
      category: p.product.category,
      name: p.product.name,
      description: p.product.description,
      price: p.product.price,
      imageUrl: p.product.imageUrl,
      quantity: p.quantity
    }));

    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
