const Customer = require('../models/Customer');

exports.getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.body.custId).populate('wishlist');

    if (!customer || !customer.wishlist || customer.wishlist.length === 0) {
      return res.status(200).json([]);
    }

    const items = customer.wishlist.map(p => ({
      id: p._id,
      category: p.category,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.image
    }));

    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.addToWishlist = async (req, res) => {
  const { productId, custId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const customer = await Customer.findById(custId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (customer.wishlist.includes(productId)) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      status: true,
      data: customer.wishlist,
      message: 'Product added to wishlist'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.emptyWishlist = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.body.custId,
      { wishlist: [] },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: 'Wishlist emptied successfully',
      data: customer.wishlist
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateWishlist = async (req, res) => {
  const { custId, productId } = req.body;

  if (!productId || !custId) {
    return res.status(400).json({ error: 'Product ID and Customer ID are required' });
  }
  try {
    const customer = await Customer.findById(custId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    } else if (!customer.wishlist.includes(productId)) {
      return res.status(400).json({ error: 'Product not in wishlist' });
    } else {
      customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
      await customer.save();
      return res.status(200).json({
        status: true,
        message: 'Product removed from wishlist successfully',
        data: customer.wishlist
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};