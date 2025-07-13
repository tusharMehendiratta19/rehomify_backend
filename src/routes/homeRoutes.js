const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController.js');

const authenticate = require('../middlewares/authenticate');

router.get('/getHomePage', homeController.getHomePage);

module.exports = router;
