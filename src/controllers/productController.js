const Product = require('../models/Product');

// GET all products categorized
exports.getAllcatProducts = async (req, res) => {
  try {
    const products = await Product.find({}, {
      id: 1,
      category: 1,
      name: 1,
      description: 1,
      price: 1,
      color: 1,
      image: 1,
      deliveryTime: 1
    });

    // const categorizedProducts = {};

    // products.forEach(product => {
    //   const key = product.category?.toLowerCase().replace(/\s/g, "_") || "uncategorized";

    //   if (!categorizedProducts[key]) {
    //     categorizedProducts[key] = [];
    //   }

    //   categorizedProducts[key].push({
    //     id: product.id,
    //     name: product.name,
    //     description: product.description,
    //     deliveryTime: product.deliveryTime,
    //     category: product.category,
    //     price: product.price,
    //     color: product.color,
    //     image: product.image
    //   });
    // });

    return res.status(200).json({ status: true, data: products });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}, {
      id: 1,
      category: 1,
      name: 1,
      description: 1,
      price: 1,
      color: 1,
      image: 1,
      deliveryTime: 1
    });

    const categorizedProducts = {};

    products.forEach(product => {
      const key = product.category?.toLowerCase().replace(/\s/g, "_") || "uncategorized";

      if (!categorizedProducts[key]) {
        categorizedProducts[key] = [];
      }

      categorizedProducts[key].push({
        id: product.id,
        name: product.name,
        description: product.description,
        deliveryTime: product.deliveryTime,
        category: product.category,
        price: product.price,
        color: product.color,
        image: product.image
      });
    });

    return res.status(200).json(categorizedProducts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ GET single product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      id: product.id,
      name: product.name,
      description: product.description,
      deliveryTime: product.deliveryTime,
      category: product.category,
      price: product.price,
      color: product.color,
      image: product.image
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getProductBySearch = async (req, res) => {
  try {
    const searchQuery = req.query.q;

    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { color: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
