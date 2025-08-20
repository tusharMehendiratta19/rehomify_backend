const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');
const e = require('express');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

exports.addProduct = async (req, res) => {
  try {
    const {
      sellerId,
      name,
      description,
      category,
      color,
      isRefurbished,
      width,
      length,
      height,
      woodMaterial,
      varieties // Array of { variety, price } or { name, price }
    } = req.body;

    const files = req.files || {};
    const mainImageFile = files.mainImage?.[0];
    const optionalImageFiles = files.optionalImages || [];

    const isNewProduct = isRefurbished === 'false';

    // Parse varieties if sent as JSON string
    let parsedVarieties = [];
    if (typeof varieties === 'string') {
      try {
        parsedVarieties = JSON.parse(varieties);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid varieties format' });
      }
    } else if (Array.isArray(varieties)) {
      parsedVarieties = varieties;
    }

    // Convert "name" → "variety" to match schema
    parsedVarieties = parsedVarieties.map(v => ({
      name: v.name, // handle both formats
      price: v.price
    }));

    // Validation
    if (
      !sellerId || !name || !description || !category || !color ||
      !isRefurbished || !width || !length || !height || !woodMaterial || !mainImageFile ||
      parsedVarieties.length === 0
    ) {
      return res.status(400).json({ message: 'All fields including main image and varieties are required' });
    }

    // Upload main image
    const mainImageKey = `products/${uuidv4()}_${mainImageFile.originalname}`;
    const mainUploadResult = await s3.upload({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: mainImageKey,
      Body: mainImageFile.buffer,
      ContentType: mainImageFile.mimetype,
      ACL: 'public-read',
    }).promise();

    const mainImageUrl = mainUploadResult.Location;

    // Upload optional images

    const optionalImageUrls = [];
    for (let i = 0; i < optionalImageFiles.length; i++) {
      const file = optionalImageFiles[i];
      const key = `products/optional/${uuidv4()}_${file.originalname}`;
      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }).promise();
      optionalImageUrls.push(uploadResult.Location);
    }

    // Save product with varieties
    const newProduct = new Product({
      name,
      description,
      category,
      color,
      price: parsedVarieties[0].price, // default price from first variety
      image: mainImageUrl,
      optionalImages: optionalImageUrls,
      sellerId,
      isRefurbished: isRefurbished === 'true',
      isNewProduct,
      width: parseFloat(width),
      height: parseFloat(height),
      length: parseFloat(length),
      woodMaterial,
      varieties: parsedVarieties
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      status: true,
      message: 'Product added successfully',
      data: savedProduct
    });
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
    const products = await Product.find(
      {},
      {
        id: 1,
        category: 1,
        name: 1,
        description: 1,
        price: 1,
        color: 1,
        image: 1,
        deliveryTime: 1,
        width: 1,
        height: 1,
        length: 1,
        woodMaterial: 1,
        isRefurbished: 1,
        isNewProduct: 1,
        optionalImages: 1,
        varieties: 1, // <-- Ensure we fetch varieties
      },
      { sort: { createdAt: -1 } }
    );

    const categorizedProducts = {};

    products.forEach((product) => {
      const key =
        product.category?.toLowerCase().replace(/\s/g, "_") || "uncategorized";

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
        image: product.image,
        width: product.width,
        height: product.height,
        length: product.length,
        woodMaterial: product.woodMaterial,
        isRefurbished: product.isRefurbished,
        isNewProduct: product.isNewProduct,
        optionalImages: product.optionalImages || [],
        varieties: product.varieties || [], // <-- Pass varieties to frontend
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

exports.editProductById = async (req, res) => {
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
      price: product.price,
      color: product.color,
      width: product.width,
      woodMaterial: product.woodMaterial,
      length: product.length,
      height: product.height,
      category: product.category,
      image: product.image,
      varieties: product.varieties
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findOneAndDelete({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found", data: product });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updatedProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      category,
      color,
      width,
      length,
      height,
      woodMaterial,
      varieties
    } = req.body;

    // Validation
    if (
      !name || !description || !varieties || !category || !color || !width || !length || !height || !woodMaterial
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const files = req.files || {};
    // const mainImageFile = files.mainImage?.[0];
    const optionalImageFiles = files.optionalImages || [];
    const optionalImageUrls = [];

    for (let i = 0; i < optionalImageFiles.length; i++) {
      const file = optionalImageFiles[i];
      const key = `products/optional/${uuidv4()}_${file.originalname}`;
      const uploadResult = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }).promise();
      optionalImageUrls.push(uploadResult.Location);
    }

    // Find existing product
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product details
    product.name = name;
    product.description = description;
    // product.price = price;
    product.category = category;
    product.color = color;
    product.width = parseFloat(width);
    product.height = parseFloat(height);
    product.length = parseFloat(length);
    product.woodMaterial = woodMaterial;
    product.varieties = varieties;
    product.optionalImages = optionalImageUrls;

    // Save updated product
    const updatedProduct = await product.save();
    return res.status(200).json({
      status: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (err) {
    console.error('Error in updatedProductById:', err);
    return res.status(500).json({ error: err.message });
  }
};