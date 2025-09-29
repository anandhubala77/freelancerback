const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Message", messageSchema);
