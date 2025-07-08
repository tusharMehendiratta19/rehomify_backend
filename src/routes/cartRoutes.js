const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middlewares/authenticate');

// GET /api/cart
router.get('/', authenticate, cartController.getCartItems);

module.exports = router;
