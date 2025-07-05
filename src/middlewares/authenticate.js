const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin'); // if stored separately
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Determine user type
    let user = null;
    if (decoded.type === 'customer') {
      user = await Customer.findById(decoded.id);
    } else if (decoded.type === 'seller') {
      user = await Seller.findById(decoded.id);
    } else if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.id);
    }

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = {
      id: user._id,
      type: decoded.type,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
