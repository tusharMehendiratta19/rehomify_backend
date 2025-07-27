const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);
router.post('/changePassword', authController.changePassword);
router.get('/getCustomerDetails/:id', authController.getCustomerDetails);
router.post('/saveCustomerDetails', authController.saveCustomerDetails);
router.post('/saveCustomerAddress', authController.saveCustomerAddress);
router.post('/saveOrder', authController.saveOrder);

module.exports = router;
