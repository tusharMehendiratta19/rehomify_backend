const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authenticate = require('../middleware/authenticate');

// GET /api/wishlist
router.get('/', authenticate, wishlistController.getWishlistItems);

module.exports = router;
