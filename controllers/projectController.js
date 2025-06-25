// freelancerbackend/controllers/projectController.js
const Project = require('../models/projectSchema');
const asyncHandler = require('express-async-handler');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (only logged-in users can post)
const createProject = asyncHandler(async (req, res) => {
  const { title, description, budget, skillsRequired, timeline, category, location } = req.body;

  if (!title || !description || !budget || !category) {
    res.status(400);
    throw new Error('Please fill all required project fields: title, description, budget, category.');
  }

  if (typeof budget !== 'number' || budget < 0) {
    res.status(400);
    throw new Error('Budget must be a positive number.');
  }

  // --- FIX APPLIED HERE ---
  const userId = req.userId; // Use req.userId which is set by your authenticateToken middleware

  const project = await Project.create({
    userId,
    title,
    description,
    budget,
    skillsRequired: skillsRequired || [],
    timeline: timeline || 'Flexible',
    category,
    location: location || 'Remote',
    status: 'posted',
  });

  res.status(201).json({
    message: 'Project posted successfully!',
    project,
  });
});

// @desc    Get all projects (e.g., for Browse)
// @route   GET /api/projects
// @access  Public (anyone can view projects)
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({})
    .populate('userId', 'name email')
    .sort({ datePosted: -1 });

  res.status(200).json(projects);
});

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('userId', 'name email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  res.status(200).json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (only project owner)
const updateProject = asyncHandler(async (req, res) => {
  const { title, description, budget, skillsRequired, timeline, category, location, status, assignedTo, progress, completionDate } = req.body;

  let project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  // --- FIX APPLIED HERE ---
  // Check if the logged-in user is the project owner
  if (project.userId.toString() !== req.userId.toString()) { // Compare with req.userId
    res.status(403);
    throw new Error('Not authorized to update this project.');
  }

  // Update fields
  project.title = title || project.title;
  project.description = description || project.description;
  project.budget = budget !== undefined ? budget : project.budget;
  project.skillsRequired = skillsRequired || project.skillsRequired;
  project.timeline = timeline || project.timeline;
  project.category = category || project.category;
  project.location = location || project.location;

  if (status) project.status = status;
  if (assignedTo) project.assignedTo = assignedTo;
  if (progress !== undefined) project.progress = progress;
  if (completionDate) project.completionDate = completionDate;

  const updatedProject = await project.save();

  res.status(200).json({
    message: 'Project updated successfully!',
    project: updatedProject,
  });
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (only project owner)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  // --- FIX APPLIED HERE ---
  // Check if the logged-in user is the project owner
  if (project.userId.toString() !== req.userId.toString()) { // Compare with req.userId
    res.status(403);
    throw new Error('Not authorized to delete this project.');
  }

  await Project.deleteOne({ _id: project._id });

  res.status(200).json({ message: 'Project removed successfully.' });
});


const reportProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { reason } = req.body;
    const reporterId = req.userId;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required." });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const alreadyReported = project.reports?.some(
      (report) => report.reportedBy.toString() === reporterId
    );

    if (alreadyReported) {
      return res.status(400).json({ message: "You already reported this project." });
    }

    // ✅ Push the report into `reports` array
    project.reports.push({
      reportedBy: reporterId,
      reason,
    });

    await project.save();

    res.status(200).json({ message: "Project reported successfully" });
  } catch (err) {
    console.error("Error reporting project:", err);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  reportProject,
};