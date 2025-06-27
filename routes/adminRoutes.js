const express = require("express");
const router = express.Router();
const { getAllProjects, deleteProject,getAllUsers,deleteUser } = require("../controllers/adminController");

// Protect these with your auth & admin middleware!
router.get("/projects", getAllProjects);
router.delete("/projects/:id", deleteProject);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;
