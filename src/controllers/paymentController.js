const axios = require("axios");
const { BASE_URL, ACCOUNT_ID, AUTH_TOKEN } = require("../config/zohoConfig");

const headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": AUTH_TOKEN
};

// 🟢 Create Payment Session
exports.createPaymentSession = async (data) => {
  const url = `${BASE_URL}/paymentsessions?account_id=${ACCOUNT_ID}`;
  const res = await axios.post(url, data, { headers });
  return res.data;
};

// 🟡 Retrieve Payment Session
exports.getPaymentSession = async (sessionId) => {
  const url = `${BASE_URL}/paymentsessions/${sessionId}?account_id=${ACCOUNT_ID}`;
  const res = await axios.get(url, { headers });
  return res.data;
};

// 💳 Retrieve Payment Details
exports.getPaymentDetails = async (paymentId) => {
  const url = `${BASE_URL}/payments/${paymentId}?account_id=${ACCOUNT_ID}`;
  const res = await axios.get(url, { headers });
  return res.data;
};

// 🔗 Create Payment Link
exports.createPaymentLink = async (data) => {
  const url = `${BASE_URL}/paymentlinks?account_id=${ACCOUNT_ID}`;
  const res = await axios.post(url, data, { headers });
  return res.data;
};

// 🔗 Retrieve Payment Link
exports.getPaymentLink = async (linkId) => {
  const url = `${BASE_URL}/paymentlinks/${linkId}?account_id=${ACCOUNT_ID}`;
  const res = await axios.get(url, { headers });
  return res.data;
};
