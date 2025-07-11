// const express = require("express");
// const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");
// const router = express.Router();
// const {
//   getAllProjects,
//   deleteProject,
//   getAllUsers,
//   deleteUser,
//   getFraudReports,
// deleteFraudReport,
// uploadProfileImage,
// } = require("../controllers/adminController");

// // Protect these with your auth & admin middleware!
// router.get("/projects", getAllProjects);
// router.delete("/projects/:id", deleteProject);

// router.get("/users", getAllUsers);
// router.delete("/users/:id", deleteUser);
// router.get("/fraud-reports", getFraudReports);
// router.delete(
//   "/fraud-reports/:type/:reportedOnId/:reportId",deleteFraudReport
// );
// router.put("/upload-profile", authenticateToken, upload.single("profile"), uploadProfileImage);

// module.exports = router;


const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

const {
  getAllProjects,
  deleteProject,
  getAllUsers,
  deleteUser,
  getFraudReports,
  deleteFraudReport,
  uploadProfileImage,
  getAdminStats,
  getAdminDashboardMetrics ,
  getPaymentById,
  
} = require("../controllers/adminController");

// Admin dashboard stats
router.get("/dashboard-metrics", getAdminDashboardMetrics );

router.get("/stats", getAdminStats); 

// routes/payment.js
router.get("/payment/:id", getPaymentById);

// Project routes
router.get("/projects", getAllProjects);
router.delete("/projects/:id", deleteProject);

// User routes
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Fraud Reports
router.get("/fraud-reports", getFraudReports);
router.delete("/fraud-reports/:type/:reportedOnId/:reportId", deleteFraudReport);

// Admin Profile image upload
router.put("/upload-profile", authenticateToken, upload.single("profile"), uploadProfileImage);

module.exports = router;

