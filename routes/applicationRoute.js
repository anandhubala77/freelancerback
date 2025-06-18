const express = require("express");
const router = express.Router();
const { authenticateToken  } = require("../middleware/authMiddleware");
const {
  getApplicationsForHiringPerson,
  updateApplicationStatus,
  getApplicationsForJobSeeker,
  withdrawApplication
} = require("../controllers/applicationController");

router.get("/hire", authenticateToken , getApplicationsForHiringPerson);
router.patch("/hire/:id/status", authenticateToken ,updateApplicationStatus);


// ✅ Job seeker route
    
router.get("/jobseeker/:id", authenticateToken, getApplicationsForJobSeeker);
router.patch("/jobseeker/:id/withdraw", authenticateToken, withdrawApplication);
module.exports = router;
