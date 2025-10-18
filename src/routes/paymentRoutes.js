const express = require('express');
const router = express.Router();
const zohoService = require("../controllers/paymentController");
const Order = require("../models/Order")
const Customer = require("../models/Customer")

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
    const event = req.body.event;
    const data = req.body.data;
    console.log("webhood request body: ", req.body)
    let custId = data.reference_number.split("-")
    custId = custId[1]
    console.log(custId)

    let customerResult = await Customer.findOne({ _id: custId }, { orders: 1 })

    if (!customerResult) {
      console.log("Customer not found");
      return res.send({
        status: false,
        message: "Customer not found"
      })
    } else {
      // console.log(customerResult.orders);
      let orderId = customerResult.orders[customerResult.orders.length - 1]

      let orderResp = await Order.updateOne(
        { _id: orderId },
        { $set: { paymentStatus: event, paymentDetails: data } }
      );

      if (!orderResp) {
        return res.send({
          status: false
        })
      } else {
        return res.send({
          status: true,
          message: "Order placed successfully",
          data: [orderId, data.status, data.payment_id]
        })
      }
    }




    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});


module.exports = router;



module.exports = router;