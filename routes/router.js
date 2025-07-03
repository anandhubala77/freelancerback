// freelancerbackend/routes/router.js

const express = require('express');
const router = new express.Router();
const upload = require("../middleware/uploadMiddleware");

// Import Controllers
const userController = require("../controllers/userController");
const projectController = require("../controllers/projectController"); // Keep this import
const hireRequestController = require("../controllers/hireRequestController");


// Import Middleware
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// --- User Routes ---
// 3.1 user registration
router.post('/user/register', userController.registerUser);
// user login
router.post('/user/login', userController.loginUser);
// admin login
router.post("/admin/login", userController.loginAdmin);

// Get logged-in user's profile
// This route needs authentication to know who is requesting their profile
router.get('/user/profile', authenticateToken, userController.getLoggedInUserProfile);

// Update logged-in user's profile
// This route needs authentication to know who is updating their profile
// Optional: You could add authorizeRoles('jobseeker') here if only jobseekers can update this specific profile.
router.put('/user/profile', authenticateToken, userController.updateUserProfile);

router.post("/users/:id/report", authenticateToken, userController.reportJobSeeker);

// --- Project Routes ---
// Create project (requires authentication, and potentially a 'company' or 'employer' role)
// Assuming only specific roles (e.g., 'company', 'employer') can post projects.
// If anyone logged in can post, just use authenticateToken.
// Example for roles: router.post('/projects', authenticateToken, authorizeRoles('company', 'employer'), projectController.createProject);
router.post("/projects", authenticateToken, upload.single("image"),projectController.createProject); // Use authenticateToken for now
// Get all projects (public)
router.get('/projects', projectController.getProjects);

// Get a single project by ID (public)
router.get('/projects/:id', projectController.getProjectById);

// Update project (requires authentication and owner authorization)
router.put('/projects/:id', authenticateToken, projectController.updateProject);

// Delete project (requires authentication and owner authorization)
router.delete('/projects/:id', authenticateToken, projectController.deleteProject);

router.post("/projects/:id/report", authenticateToken, projectController.reportProject);

//job hire

// New route to get job seeker by ID
router.get("/jobseekers/:id", authenticateToken, userController.getJobSeekerById);

router.post("/hire-requests/send", authenticateToken, hireRequestController.sendHireRequest);



module.exports = router;