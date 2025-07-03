const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getApplicationsForHiringPerson,
  updateApplicationStatus,
  getApplicationsForJobSeeker,
  withdrawApplication,
  submitCompletedWork,
  approveSubmission,
  requestChanges,
  
} = require("../controllers/applicationController");

router.get("/hire", authenticateToken, getApplicationsForHiringPerson);
router.patch("/hire/:id/status", authenticateToken, updateApplicationStatus);


// ✅ Job seeker route

router.get("/jobseeker/:id", authenticateToken, getApplicationsForJobSeeker);
router.patch("/jobseeker/:id/withdraw", authenticateToken, withdrawApplication);

//submit project

router.post("/work/:id/submit-work", authenticateToken, submitCompletedWork);
router.patch("/submission/:submissionId/approve", authenticateToken, approveSubmission);
router.patch("/submission/:submissionId/request-changes", authenticateToken, requestChanges);



module.exports = router;
