const axios = require("axios");
const { BASE_URL, ACCOUNT_ID, client_id, client_secretId, refresh_token, auth_token } = require("../config/zohoConfig");

let AUTH_TOKEN = auth_token; // Will be dynamically updated

// 🔄 Function to refresh access token
async function getAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", client_id);
    params.append("client_secret", client_secretId);
    params.append("refresh_token", refresh_token);

    const { data } = await axios.post("https://accounts.zoho.in/oauth/v2/token", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    console.log("🔑 New Access Token:", data.access_token);
    console.log("⏳ Expires In:", data.expires_in, "seconds");

    AUTH_TOKEN = data.access_token; // Update global token

    return AUTH_TOKEN;
  } catch (err) {
    console.error("❌ Error refreshing Zoho access token:", err.response?.data || err.message);
    throw err;
  }
}

// Helper to build headers dynamically
function buildHeaders() {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${AUTH_TOKEN}`
  };
}

// 🟢 Create Payment Session
exports.createPaymentSession = async (data) => {
  try {
    let url = `${BASE_URL}/paymentsessions?account_id=${ACCOUNT_ID}`;
    let res = await axios.post(url, data, { headers: buildHeaders() });
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log("⚠️ Access token expired — refreshing...");
      await getAccessToken(); // refresh token
      const res = await axios.post(`${BASE_URL}/paymentsessions?account_id=${ACCOUNT_ID}`, data, {
        headers: buildHeaders()
      });
      return res.data;
    } else {
      console.error("❌ Error creating payment session:", err.response?.data || err.message);
      throw err;
    }
  }
};


// 🟡 Retrieve Payment Session
exports.getPaymentSession = async (sessionId) => {
  let url = `${BASE_URL}/paymentsessions/${sessionId}?account_id=${ACCOUNT_ID}`;
  let res = await axios.get(url, { headers });
  return res.data;
};

// 💳 Retrieve Payment Details
exports.getPaymentDetails = async (paymentId) => {
  let url = `${BASE_URL}/payments/${paymentId}?account_id=${ACCOUNT_ID}`;
  let res = await axios.get(url, { headers });
  return res.data;
};

// 🔗 Create Payment Link
exports.createPaymentLink = async (data) => {
  let url = `${BASE_URL}/paymentlinks?account_id=${ACCOUNT_ID}`;
  let res = await axios.post(url, data, { headers });
  return res.data;
};

// 🔗 Retrieve Payment Link
exports.getPaymentLink = async (linkId) => {
  let url = `${BASE_URL}/paymentlinks/${linkId}?account_id=${ACCOUNT_ID}`;
  let res = await axios.get(url, { headers });
  return res.data;
};
