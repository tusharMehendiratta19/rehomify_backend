// Resell order routes
const express = require('express');
const router = express.Router();
const resellOrderController = require('../controllers/resellOrderController');
const authenticate = require('../middlewares/authenticate');

// GET /api/resell-orders
router.get('/', authenticate, resellOrderController.getResellOrders);

module.exports = router;
