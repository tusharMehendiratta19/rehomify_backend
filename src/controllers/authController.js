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

      const customer = new Customer({ name, mobileNo, email, type, password: hashedPassword });
      let addedData = await customer.save();
      if (addedData) {
        const token = jwt.sign({ id: addedData._id, role: data.type }, JWT_SECRET, { expiresIn: '7d' });
        addedData = addedData.toObject();
        delete addedData.password;
        delete addedData.__v;

        return res.status(200).json({
          status: true,
          message: `${type} registered successfully`,
          data: addedData,
          token
        });
      }

    } else if (type === 'seller') {
      const existingSeller = await Seller.findOne({ mobileNo });
      if (existingSeller) return res.status(400).json({ message: 'Seller already exists' });

      const seller = new Seller({ name, mobileNo, email, type, password: hashedPassword });

      let addedData = await seller.save();
      if (addedData) {
        const token = jwt.sign({ id: addedData._id, role: data.type }, JWT_SECRET, { expiresIn: '7d' });
        addedData = addedData.toObject();
        delete addedData.password; // Remove password from response
        delete addedData.__v; // Remove version key from response

        return res.status(200).json({
          status: true,
          message: `${type} registered successfully`,
          data: addedData,
          token
        });
      }
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
    return res.status(200).json({ token, role: userType, user, status: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { mobileNo, password } = req.body;

    if (!mobileNo || !password) {
      return res.status(400).json({ message: 'Mobile number and password are required.' });
    }

    // Search in Customer and Seller collections
    let user = await Customer.findOne({ mobileNo });
    let userType = 'customer';

    if (!user) {
      user = await Seller.findOne({ mobileNo });
      userType = 'seller';
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    const token = jwt.sign({ id: user._id, role: userType }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Password updated successfully',
      token,
      role: userType,
      user,
      status: true
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
