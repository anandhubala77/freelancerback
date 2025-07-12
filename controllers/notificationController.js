// controllers/notificationController.js
const Notification = require("../models/notificationSchema");

// GET all notifications for a logged-in user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications", error: err });
  }
};

// PUT mark a notification as seen
exports.markNotificationSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { seen: true });
    res.status(200).json({ message: "Notification marked as seen" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as seen", error: err });
  }
};
