// Resell order routes
const express = require('express');
const router = express.Router();
const resellOrderController = require('../controllers/resellOrderController');
const authenticate = require('../middlewares/authenticate');

// GET /api/resell-orders
router.get('/', resellOrderController.getResellOrders);
router.post('/addResellOrder', resellOrderController.addResellOrder);
router.get('/:resellOrderId', resellOrderController.getResellOrderById);
router.get('/customer/:customerId', resellOrderController.getResellOrdersByCustomer);
router.put('/:resellOrderId', resellOrderController.updateResellOrderStatus);

module.exports = router;
