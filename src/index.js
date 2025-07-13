// src/routes/index.js

const express = require('express');
const router = express.Router();

router.use('/auth', require('./routes/authRoutes'));
router.use('/products', require('./routes/productRoutes'));
router.use('/orders', require('./routes/orderRoutes'));
router.use('/resell-orders', require('./routes/resellOrderRoutes'));
router.use('/admin', require('./routes/adminRoutes'));
router.use('/offers', require('./routes/offerRoutes'));
router.use('/cart', require('./routes/cartRoutes'));
router.use('/wishlist', require('./routes/wishlistRoutes'));
router.use('/home', require('./routes/homeRoutes'));

// 404 handler for unknown API routes
router.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

module.exports = router;
