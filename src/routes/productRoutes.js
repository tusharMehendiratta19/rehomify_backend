const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET endpoints
router.get('/', productController.getAllProducts);
router.get('/all', productController.getAllcatProducts);
router.get('/search', productController.getProductBySearch);
router.get('/:id', productController.getProductById);
router.get('/edit/:id', productController.editProductById);
router.get('/delete/:id', productController.deleteProductById);
router.post('/updatedProduct/:id', upload.fields([
    { name: 'optionalImages', maxCount: 4 }
]), productController.updatedProductById);

// POST endpoint for product with 1 main image + up to 4 optional images
router.post(
    '/addProduct',
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'optionalImages', maxCount: 4 }
    ]),
    productController.addProduct
);

module.exports = router;
