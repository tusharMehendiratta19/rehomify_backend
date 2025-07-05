const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize'); // restrict to admin

router.use(authenticate, authorize('admin'));

// Offer routes
router.post('/offers', adminController.createOffer);
router.put('/offers/:id', adminController.editOffer);

// View routes
router.get('/sellers', adminController.getAllSellers);
router.get('/customers', adminController.getAllCustomers);
router.get('/products', adminController.getAllProducts);
router.get('/resell-orders', adminController.getAllResellOrders);
router.get('/reviews', adminController.getAllReviews);

// Confirm resell order
router.put('/resell-orders/:id/confirm', adminController.confirmResellOrder);

module.exports = router;
