const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/WishlistController.js');

const authenticate = require('../middlewares/authenticate');

// GET /api/wishlist
router.post('/getWishlist', wishlistController.getWishlist);
router.post('/addToWishlist', wishlistController.addToWishlist);
router.post('/emptyWishlist', wishlistController.emptyWishlist);
router.post('/updateWishlist', wishlistController.updateWishlist);

module.exports = router;
