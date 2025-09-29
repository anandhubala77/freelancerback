const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");


router.get("/eligible", authenticateToken, chatController.getEligibleChats);// projects where this user can chat



router.get("/:projectId/history", authenticateToken, chatController.getHistory);// Get chat history for a project



router.post("/:projectId/send", authenticateToken, chatController.sendMessage);// Send a message in a project chat

module.exports = router;