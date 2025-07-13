const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}, {
      _id: 1,
      id: 1,
      category: 1,
      name: 1,
      description: 1,
      price: 1,
      color: 1,
      image: 1,
      details: 1
    });

    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

