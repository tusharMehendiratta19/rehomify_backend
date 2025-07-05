const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes authentication middleware sets req.user
    const orders = await Order.find({ user: userId })
      .populate('products.product', 'category name description price imageUrl');

    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      status: order.status,
      products: order.products.map(p => ({
        id: p.product._id,
        category: p.product.category,
        name: p.product.name,
        description: p.product.description,
        price: p.product.price,
        imageUrl: p.product.imageUrl
      }))
    }));

    return res.status(200).json(formattedOrders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
