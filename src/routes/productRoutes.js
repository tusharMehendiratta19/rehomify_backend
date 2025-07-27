const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products
router.get('/', productController.getAllProducts);
router.get('/all', productController.getAllcatProducts);
router.get('/search', productController.getProductBySearch);
router.get('/:id', productController.getProductById);

module.exports = router;
