const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes authentication middleware sets req.user
    const orders = await Order.find({ user: userId })
      .populate('products.product', 'category name description price imageUrl');

    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      status: order.status,
      products: order.products.map(p => ({
        id: p.product._id,
        category: p.product.category,
        name: p.product.name,
        description: p.product.description,
        price: p.product.price,
        imageUrl: p.product.imageUrl
      }))
    }));

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

    await newOrder.save();

    res.status(201).json({
      status: true,
      message: "Order placed successfully",
      order: newOrder
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};