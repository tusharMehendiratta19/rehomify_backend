const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.signup = async (req, res) => {
  try {
    const { name, mobileNo, email, type, city, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (type === 'customer') {
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) return res.status(400).json({ message: 'Customer already exists' });

      const customer = new Customer({ name, mobileNo, email, city, password: hashedPassword });
      await customer.save();
      return res.status(201).json({ message: 'Customer registered successfully' });
    } else if (type === 'seller') {
      const existingSeller = await Seller.findOne({ mobileNo });
      if (existingSeller) return res.status(400).json({ message: 'Seller already exists' });

      const seller = new Seller({ name, mobileNo, email, city, password: hashedPassword });
      await seller.save();
      return res.status(201).json({ message: 'Seller registered successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, mobileNo, password } = req.body;

    let user = null;
    let userType = null;

    if (email) {
      user = await Customer.findOne({ email });
      userType = 'customer';
    } else if (mobileNo) {
      user = await Seller.findOne({ mobileNo });
      userType = 'seller';
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: userType }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({ token, role: userType, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
