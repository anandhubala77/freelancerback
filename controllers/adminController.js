const Project = require("../models/projectSchema");
const User = require("../models/userSchema");

// GET /admin/projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("userId", "name lastName")      // who posted
      .populate("reports.reportedBy", "name");  // who reported

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

// DELETE /admin/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Trying to delete project:", id);
    await Project.findByIdAndDelete(id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete project" });
  }
};

// controllers/adminController.js
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({ role: { $ne: 'admin' } });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  };
// controllers/adminController.js
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({ role: { $ne: 'admin' } });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  };
    
// controllers/adminController.js
exports.deleteUser = async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  };
  