const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require("mongoose");

exports.getOrders = async (req, res) => {
  try {
    const customerId = req.params.custId;

    // Validate customerId as ObjectId
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Step 1: Find orders for the customer and get all productIds
    const orders = await Order.find({ customerId }).select("productId quantity createdAt deliveryDate status");

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this customer" });
    }

    const productIds = orders.map(order => order.productId);

    // Step 2: Fetch all matching products
    const products = await Product.find({ _id: { $in: productIds } }).select("category name description price image");

    console.log("products: ", products);

    // Step 3: Create a map of productId to product for fast lookup
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product._id.toString(), product);
    });

    // Step 4: Format the order list
    const formattedOrders = orders.map(order => {
      const product = productMap.get(order.productId.toString());

      return {
        id: order._id,
        orderDate: order.createdAt,
        deliveryDate: order.deliveryDate,
        status: order.status,
        quantity: order.quantity,
        product: product ? {
          id: product._id,
          category: product.category,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.image,
        } : null,
      };
    });

    return res.status(200).json(formattedOrders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.addOrder = async (req, res) => {
  try {
    const { productId, customerId, quantity } = req.body;

    // Validate required fields
    if (!productId || !customerId) {
      return res.status(400).json({ message: "productId and customerId are required" });
    }

    // Find the product to get sellerId, isNew, isRefurbished
    const product = await Product.findById(productId);
    console.log("product: ", product)

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // else {
    //   return res.send({
    //     status: true,
    //     result: product
    //   })
    // }

    const newOrder = new Order({
      productId,
      customerId,
      quantity,
      sellerId: product.sellerId,
      isNewProduct: product.isNewProduct,
      isRefurbished: product.isRefurbished,
      status: "placed"
    });

    const result = await newOrder.save();

    res.status(201).json({
      status: true,
      message: "Order placed successfully",
      order: result
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};