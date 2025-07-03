const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  razorpayPaymentId: { type: String, required: true },
  razorpayOrderId: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation", required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  paidTo: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  paidAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Payment", paymentSchema);
