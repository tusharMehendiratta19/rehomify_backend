const express = require('express');
const router = express.Router();
const zohoService = require("../controllers/paymentController");

// Create Payment Session
router.post("/payment-session", async (req, res) => {
  try {
    const result = await zohoService.createPaymentSession(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Payment Session
router.get("/payment-session/:id", async (req, res) => {
  try {
    const result = await zohoService.getPaymentSession(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Payment Details
router.get("/payment/:id", async (req, res) => {
  try {
    const result = await zohoService.getPaymentDetails(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Payment Link
router.post("/payment-link", async (req, res) => {
  try {
    const result = await zohoService.createPaymentLink(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Payment Link
router.get("/payment-link/:id", async (req, res) => {
  try {
    const result = await zohoService.getPaymentLink(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;



module.exports = router;