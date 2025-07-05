const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');

// GET /api/orders
router.get('/', authenticate, orderController.getOrders);

module.exports = router;
