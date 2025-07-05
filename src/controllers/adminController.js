const Offer = require('../models/Offer');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const ResellOrder = require('../models/ResellOrder');
const Review = require('../models/Review');

// Offer management
exports.createOffer = async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    return res.status(201).json({ message: 'Offer created successfully', offer });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.editOffer = async (req, res) => {
  try {
    const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ message: 'Offer updated successfully', updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// View data
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    return res.status(200).json(sellers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    return res.status(200).json(customers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllResellOrders = async (req, res) => {
  try {
    const orders = await ResellOrder.find()
      .populate('products.product', 'name description price imageUrl');
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('product', 'name');
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.confirmResellOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ResellOrder.findByIdAndUpdate(id, { status: 'confirmed' }, { new: true });
    return res.status(200).json({ message: 'Resell order confirmed', updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
