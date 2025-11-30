const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// GET /api/offers - anyone can view offers
router.get('/', reviewController.getAllReviews);
router.post('/createReview', reviewController.createReview);
router.post('/editReview', reviewController.editReview);

module.exports = router;
