const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');

// GET /api/offers - anyone can view offers
router.get('/', offerController.getAllOffers);

module.exports = router;
