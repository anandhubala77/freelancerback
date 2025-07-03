  const Payment = require('../models/paymentSchema');
const razorpay = require("../utils/razorpay");

exports.createPaymentOrder = async (req, res) => {
  const { amount, jobId, paidTo, currency = "INR" } = req.body;

  if (!amount || !jobId || !paidTo)
    return res.status(400).json({ message: "Missing required fields" });

  const options = {
    amount: amount * 100, // paise
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      jobId,
      paidTo,
    });
  } catch (err) {
    res.status(500).json({ message: "Payment initiation failed", error: err });
  }
};


// controllers/paymentController.js

exports.markPaymentSuccess = async (req, res) => {
  const {
    razorpayPaymentId,
    razorpayOrderId,
    amount,
    jobId,
    quotationId,
    paidBy,
    paidTo,
  } = req.body;

  if (
    !razorpayPaymentId ||
    !razorpayOrderId ||
    !amount ||
    !jobId ||
    !quotationId ||
    !paidBy ||
    !paidTo
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const payment = new Payment({
      razorpayPaymentId,
      razorpayOrderId,
      amount,
      jobId,
      quotationId,
      paidBy,
      paidTo,
      status: "completed",
      paidAt: new Date(),
    });

    await payment.save();
    console.log("✅ Payment saved:", payment);

    res.status(201).json({ message: "Payment stored successfully" });
  } catch (err) {
    console.error("Payment Save Error:", err);
    res.status(500).json({ message: "Failed to store payment", error: err });
  }
};
exports.getReceivedPayments = async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const payments = await Payment.find({ paidTo: freelancerId })
      .populate("jobId", "title")
      .populate("paidBy", "name email");

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments", error });
  }
};





exports.getSentPaymentsHiring = async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching sent payments for:", userId);

  try {
    const payments = await Payment.find({ paidBy: userId })
      .populate("jobId", "title")
      .populate("paidTo", "name lastName");
      console.log("Payments found:", payments);

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sent payments", error: err.message });
  }
};
// Get all payments for admin
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("jobId", "title")
      .populate("quotationId", "_id")
      .populate("paidBy", "name email role")
      .populate("paidTo", "name email role");

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all payments", error });
  }
};








