const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markNotificationSeen,
} = require("../controllers/notificationController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getUserNotifications);
router.put("/:id/seen", authenticateToken, markNotificationSeen);

module.exports = router;
