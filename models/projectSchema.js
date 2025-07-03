const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 2000,
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  timeline: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "Flexible",
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "Remote",
  },
  image: {
    type: String, // ✅ Added image (URL or filename)
    default: "",
  },
  status: {
    type: String,
    enum: ["posted", "active", "completed", "cancelled"],
    default: "posted",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    default: null,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  completionDate: {
    type: Date,
    default: null,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    default: null,
  },
  reports: [
    {
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      reason: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true // ✅ Adds createdAt and updatedAt
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
