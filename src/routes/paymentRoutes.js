const express = require('express');
const router = express.Router();
const zohoService = require("../controllers/paymentController");
const Order = require("../models/Order")
const Customer = require("../models/Customer")
const { processInvoiceAndEmail } = require("../utils/invoiceService");
// Create Payment Session
router.post("/payment-session", async (req, res) => {
  try {
    const result = await zohoService.createPaymentSession(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Payment Session // 14849000000067052
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

// get payments list
router.get("/paymentList", async (req, res) => {
  try {
    const result = await zohoService.getPaymentsList();
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

router.post("/zoho-webhook", express.json(), async (req, res) => {
  try {
    const event = req.body.event_type;
    const data = req.body.event_object.payment;

    console.log("Webhook body:", req.body);

    let custId = data.reference_number.split("-")[1];

    const customer = await Customer.findById(custId, { orders: 1 });

    if (!customer) {
      return res.send({
        status: false,
        message: "Customer not found"
      });
    }

    const orderId = customer.orders[customer.orders.length - 1];

    await Order.updateOne(
      { _id: orderId },
      { $set: { paymentStatus: event, paymentDetails: data } }
    );

    if (event === "payment.succeeded") {
      await processInvoiceAndEmail(orderId);
    }

    return res.send({
      status: true,
      message: "Order updated",
      data: [orderId, data.status, data.payment_id]
    });

  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});


module.exports = router;