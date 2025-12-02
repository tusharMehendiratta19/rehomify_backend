const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authenticate');

// GET /api/orders
router.get('/', orderController.getAllOrders);
router.get('/:custId', orderController.getOrders);
router.post('/addOrder', orderController.addOrder);
router.get("/getInvoice/:orderId", orderController.getInvoice)
router.post("/generateInvoice", orderController.generateInvoice)

module.exports = router;
