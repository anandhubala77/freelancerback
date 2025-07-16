const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project", // or whatever your job/project model is called
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // jobseeker
    required: true,
  },
  bidAmount: {
    type: Number,
    required: true,
  },
  completionTime: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', "withdrawn"],
    default: 'pending',
  },
  submission: {
    link: String,
    message: String,
    submittedAt: Date,
  },
  correctionRequest: {
    message: String,
    requestedAt: Date,
    responded: {
      type: Boolean,
      default: false,
    },
  }
  
});

module.exports = mongoose.model("Quotation", quotationSchema);
