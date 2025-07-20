const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middlewares/authenticate');

// GET /api/cart
router.post('/getCartItems', cartController.getCartItems);
router.post('/addToCart', cartController.addToCart);
router.post('/removeFromCart', cartController.removeFromCart);
router.post('/updateCart', cartController.updateCart);

module.exports = router;
