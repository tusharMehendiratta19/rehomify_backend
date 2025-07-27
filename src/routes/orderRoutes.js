const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authenticate');

// GET /api/orders
router.get('/:custId', orderController.getOrders);
router.post('/addOrder', orderController.addOrder);

module.exports = router;
