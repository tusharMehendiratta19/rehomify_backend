const Customer = require('../models/Customer');

exports.getCartItems = async (req, res) => {
  try {
    const customer = await Customer.findById(req.body.custId).populate('cart.productId');

    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'Cart is empty',
        data: []
    });
    }

    const items = customer.cart.map(item => {
      const product = item.productId;
      return {
        id: product._id,
        category: product.category,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.image,
        quantity: item.quantity
      };
    });

    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.addToCart = async (req, res) => {
  const { custId, productId, quantity = 1 } = req.body;

  if (!productId || !custId) {
    return res.status(400).json({ error: 'Product ID and Customer ID is required' });
  }

  try {
    const customer = await Customer.findById(custId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Ensure cart array exists
    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    const productIndex = customer.cart.findIndex(item => item.productId.toString() === productId);

    if (productIndex > -1) {
      // Product already in cart, update quantity
      customer.cart[productIndex].quantity += quantity;
    } else {
      // Add new product to cart
      customer.cart.push({ productId, quantity });
    }

    await customer.save();

    return res.status(200).json({
      status: true,
      message: 'Product added to cart successfully',
      data: {
        cart: customer.cart
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { custId, productId } = req.body;

  if (!productId || !custId) {
    return res.status(400).json({ error: 'Product ID and Customer ID is required' });
  }

  try {
    const customer = await Customer.findById(custId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    customer.cart = customer.cart.filter(item => item.productId.toString() !== productId);

    await customer.save();

    return res.status(200).json({
      status: true,
      message: 'Product removed from cart successfully',
      data: {
        cart: customer.cart
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

exports.updateCart = async (req, res) => {
  const { custId, productId, quantity } = req.body;

  if (!productId || !custId || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Product ID, Customer ID, and quantity are required' });
  }

  if (![1, -1].includes(quantity)) {
    return res.status(400).json({ error: 'Quantity must be either 1 or -1' });
  }

  try {
    const customer = await Customer.findById(custId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const productIndex = customer.cart.findIndex(item => item.productId.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    const currentQuantity = customer.cart[productIndex].quantity;
    const updatedQuantity = currentQuantity + quantity;

    // Restrict to max 3
    if (quantity === 1 && currentQuantity >= 3) {
      return res.status(400).json({ error: 'Maximum quantity for this product is 3' });
    }

    if (updatedQuantity <= 0) {
      // Remove product from cart if quantity becomes 0 or less
      customer.cart.splice(productIndex, 1);
    } else {
      // Update quantity
      customer.cart[productIndex].quantity = updatedQuantity;
    }

    await customer.save();

    return res.status(200).json({
      status: true,
      message: 'Cart item updated successfully',
      data: {
        cart: customer.cart
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
