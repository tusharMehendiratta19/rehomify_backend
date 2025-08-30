const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');
const axios = require("axios");

function generateOtp() {
  const max = 9999;
  const min = 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.sendOtp = async (req, resp) => {
  const otp = generateOtp();
  console.log("Generated OTP:", otp, typeof otp);

  try {
    const result = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "otp",
        variables_values: otp,
        numbers: req.body.mobileNo, // must be string
        flash: 0
      },
      {
        headers: {
          authorization:
            "YTyhJxpGjDlo3urIZti1mc7k6N8fFUq5QwBHg9bVRsO240KEAvex1m6CdhqjZap4M37FXfiLIUnDNk2c",
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Fast2SMS Response:", result.data);

    if (result.data.return) {
      let updateResult = await Customer.updateOne(
        { mobileNo: req.body.mobileNo },
        { $set: { otp: otp } },
        { upsert: true }
      );

      if (updateResult) {
        resp.send({
          status: true,
          message: "OTP sent successfully. Please check your SMS",
        });
      }

    } else {
      resp.send({
        status: false,
        message: result.data.message || "Could not send OTP"
      });
    }
  } catch (err) {
    console.error("Error sending OTP:", err.message);
    resp.status(500).send({
      status: false,
      message: "Server error while sending OTP"
    });
  }
};


exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNo, otp } = req.body;
    console.log("request body: ", req.body)
    if (!mobileNo || !otp) {
      return res.status(400).json({ status: false, message: 'Mobile number and OTP are required.' });
    }

    const customer = await Customer.findOne({ mobileNo });
    console.log("customer: ", customer)
    if (!customer) {
      return res.status(404).json({ status: false, message: 'Customer not found.' });
    }

    if (customer.otp && customer.otp.toString() === otp.toString()) {
      // console.log("customer: ", customer)
      const token = jwt.sign({ id: customer._id, role: customer.type }, JWT_SECRET, { expiresIn: '7d' });
      // Optionally clear OTP after verification
      // customer.otp = undefined;
      // await customer.save();
      return res.status(200).json({ status: true, message: 'OTP verified successfully.', data: customer, token });
    } else {
      return res.status(400).json({ status: false, message: 'Invalid OTP.' });
    }
  } catch (err) {
    return res.status(500).json({ status: false, error: err.message });
  }
};

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

        addedData = addedData.toObject();
        delete addedData.password;
        delete addedData.__v;

        return res.status(200).json({
          status: true,
          message: `${type} registered successfully`,
          data: addedData
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


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';



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

    const token = jwt.sign({ id: user._id, role: userType }, JWT_SECRET, { expiresIn: '1d' });
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

exports.getCustomerDetails = async (req, res) => {
  try {
    const custId = req.params.id;

    if (!custId) {
      return res.status(400).json({ message: 'Customer not found. Please sign up.' });
    }

    const customer = await Customer.findById(custId).select('-password -__v');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    return res.status(200).json({ status: true, data: customer });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.saveCustomerDetails = async (req, res) => {
  try {
    const { id, name, mobileNo, email } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    const customer = await Customer.findById(id);
    console.log(customer);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    customer.name = name || customer.name;
    customer.mobileNo = mobileNo || customer.mobileNo;
    customer.email = email || customer.email;
    const updatedCustomer = await customer.save();
    return res.status(200).json({ status: true, message: 'Customer details updated successfully', data: updatedCustomer });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.saveCustomerAddress = async (req, res) => {
  try {
    const { custId, name, addressLine1, addressLine2, landmark, pinCode, city, state } = req.body;

    if (!custId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    const customer = await Customer.findById(custId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    customer.address.name = name || customer.name;
    customer.address.addressLine1 = addressLine1 || customer.addressLine1;
    customer.address.addressLine2 = addressLine2 || customer.addressLine2;
    customer.address.landmark = landmark || customer.landmark;
    customer.address.pinCode = pinCode || customer.pinCode;
    customer.address.city = city || customer.city;
    customer.address.state = state || customer.state;
    const updatedCustomer = await customer.save();
    return res.status(200).json({ status: true, message: 'Customer address updated successfully', data: updatedCustomer });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.saveOrder = async (req, res) => {
  try {
    const { orderId, customerId } = req.body;

    if (!orderId || !customerId) {
      return res.status(400).json({ message: 'Order ID and Customer ID are required' });
    }

    // Find the customer by customerId
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Initialize orders array if not present
    if (!Array.isArray(customer.orders)) {
      customer.orders = [];
    }

    // Add the new orderId to the orders array
    customer.orders.push(orderId);

    // Optionally, you can store more order details if needed
    // Save the updated customer document
    let result = await customer.save();

    // For response, you can return the updated customer or just a success message
    // const order = { orderId, customerId, productId };

    // await order.save();
    return res.status(201).json({ status: true, message: 'Order saved successfully', data: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

