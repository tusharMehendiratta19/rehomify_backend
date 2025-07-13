// routes/homepageRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');

exports.getHomePage = async (req, res) => {
  try {
    const products = await Product.find().limit(15);
    const reviews = await Review.find().limit(5);

    res.status(200).json({
      success: true,
      products,
      reviews
    });
  } catch (error) {
    console.error('Error in homepage API:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

