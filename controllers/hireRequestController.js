const HireRequest = require("../models/HireRequestSchema");

exports.sendHireRequest = async (req, res) => {
  try {
    const { senderId, receiverId, jobId, message } = req.body;

    const newRequest = new HireRequest({
      senderId,
      receiverId,
      jobId,
      message,
      status: "pending",
    });

    await newRequest.save();

    res.status(201).json({ message: "Hire request sent successfully" });
  } catch (error) {
    console.error("Error sending hire request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// controllers/hireRequestController.js



