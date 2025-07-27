const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');

// AWS S3 Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

exports.addProduct = async (req, res) => {
  try {
    const { sellerId, name, description, price, category, color, isRefurbished, width, length, height, woodMaterial } = req.body;
    const file = req.file;
    const isNewProduct = isRefurbished == 'false' ? true : false;
    console.log('Received file:', file);
    console.log('Received body:', req.body);

    // Validate required fields
    if (!sellerId || !name || !description || !price || !category || !color || !file || !isRefurbished || !width || !length || !height || !woodMaterial) {
      return res.status(400).json({ message: 'All fields including image are required' });
    }

    // Upload image to S3
    const fileKey = `products/${uuidv4()}_${file.originalname}`;
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL:'public-read', // Make the file publicly readable
    }).promise();

    const imageUrl = uploadResult.Location;

    // Create product with image URL
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      color,
      image: imageUrl,
      sellerId,
      isRefurbished,
      isNewProduct,
      width: parseFloat(width),
      height: parseFloat(height),
      length: parseFloat(length),
      woodMaterial,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({ status: true, message: 'Product added successfully', data: savedProduct });
  } catch (err) {
    console.error('Error in addProduct:', err);
    return res.status(500).json({ error: err.message });
  }
};


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
