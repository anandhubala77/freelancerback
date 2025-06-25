// utils/razorpay.js
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: "rzp_test_HnpMhDOhL0dI1d",
  key_secret: "0ox7P6qS02HPp6I8oXJ5lRvy",
});

module.exports = razorpayInstance;
