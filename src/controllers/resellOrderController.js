const ResellOrder = require('../models/ResellOrder');
const Order = require('../models/Order');

exports.getResellOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Set by authentication middleware
    const orders = await ResellOrder.find({ user: userId })
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

exports.addResellOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('productId');
    console.log(order);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const existingResellOrder = await ResellOrder.findOne({ orderId: orderId });
    if (existingResellOrder) {
      return res.status(400).json({ error: 'Resell order for this order already exists' });
    }

    const newResellOrder = new ResellOrder({
      customer: order.customerId,
      orderId: orderId,
      product: order.productId,
      orderDate: order.orderDate,
      seller: order.sellerId,
      status: 'Requested',
      productDetails: {
        category: order.productId.category,
        name: order.productId.name,
        description: order.productId.description,
        price: order.productId.price,
        imageUrl: order.productId.image
      }
    });

    const resellOrder = await newResellOrder.save();
    if (!resellOrder) {
      return res.status(500).json({ error: 'Failed to create resell order' });
    }
    else {
      await Order.findByIdAndUpdate(orderId, { resellOrderId: resellOrder._id, isResellRequested: true });
    }
    return res.status(201).json({ message: 'Resell order created successfully', resellOrderId: newResellOrder._id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getResellOrderById = async (req, res) => {
  try {
    const { resellOrderId } = req.params;
    const order = await ResellOrder.findById(resellOrderId)
    if (!order) {
      return res.status(404).json({ error: 'Resell order not found' });
    }
    // const formattedOrder = {
    //   id: order._id,
    //   orderDate: order.orderDate,
    //   status: order.status,
    //   product: {
    //     id: order.product._id,
    //     category: order.product.category,
    //     name: order.product.name,
    //     description: order.product.description,
    //     price: order.product.price,
    //     imageUrl: order.product.imageUrl
    //   },
    //   customer: {
    //     id: order.customer._id,
    //     name: order.customer.name,
    //     email: order.customer.email
    //   }
    // };
    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getResellOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await ResellOrder.find({ customer: customerId });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateResellOrderStatus = async (req, res) => {
  try {
    const { resellOrderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Requested', 'Accepted', 'Rejected', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const order = await ResellOrder.findById(resellOrderId);
    if (!order) {
      return res.status(404).json({ error: 'Resell order not found' });
    }
    order.status = status;
    await order.save();
    return res.status(200).json({ success: true, message: 'Resell order status updated successfully' });
  }
  catch (err) {
    return res.status(500).json({ error: err.message });
  }
};