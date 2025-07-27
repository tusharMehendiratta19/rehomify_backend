const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');

// Multer config (in-memory)
const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// GET endpoints
router.get('/', productController.getAllProducts);
router.get('/all', productController.getAllcatProducts);
router.get('/search', productController.getProductBySearch);
router.get('/:id', productController.getProductById);

const upload = multer({ storage });
router.post('/addProduct', upload.single('image'), productController.addProduct);


module.exports = router;
