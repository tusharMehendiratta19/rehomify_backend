const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');

// GET /api/offers - anyone can view offers
router.get('/', offerController.getAllOffers);
router.post('/createOffer', offerController.createOffer);
router.post('/editOffer', offerController.editOffer);
router.post('/disableOffer', offerController.disableOffer);

module.exports = router;
