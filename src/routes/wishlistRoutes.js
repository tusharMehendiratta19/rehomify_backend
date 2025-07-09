const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/WishlistController.js');

const authenticate = require('../middlewares/authenticate');

// GET /api/wishlist
router.get('/', authenticate, wishlistController.getWishlistItems);

module.exports = router;
