const Project = require('../models/projectSchema');
const asyncHandler = require('express-async-handler');


const createProject = asyncHandler(async (req, res) => {
  console.log("REQ.BODY:", req.body); // ✅ log body
  console.log("REQ.FILE:", req.file); // ✅ log uploaded file

  const {
    title,
    description,
    budget,
    skillsRequired,
    timeline,
    category,
    location,
  } = req.body;

  // Validate required fields
  if (!title || !description || !budget || !category) {
    res.status(400);
    throw new Error(
      'Please fill all required project fields: title, description, budget, category.'
    );
  }

  // Parse budget
  const parsedBudget = parseFloat(budget);
  if (isNaN(parsedBudget) || parsedBudget < 0) {
    res.status(400);
    throw new Error('Budget must be a positive number.');
  }

  // Handle userId from middleware
  const userId = req.userId || (req.user && req.user._id);
  if (!userId) {
    res.status(401);
    throw new Error("Unauthorized: Missing user ID.");
  }

  // Handle image from multer
  const image = req.file ? req.file.filename : "";

  // Handle skills (if sent as comma-separated string or array)
  let skillsArray = [];
  if (typeof skillsRequired === 'string') {
    skillsArray = skillsRequired
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
  } else if (Array.isArray(skillsRequired)) {
    skillsArray = skillsRequired.map((s) => s.trim()).filter(Boolean);
  }

  const project = await Project.create({
    userId,
    title,
    description,
    budget: parsedBudget,
    skillsRequired: skillsArray,
    timeline: timeline || 'Flexible',
    category,
    location: location || 'Remote',
    image,
    status: 'posted',
  });

  res.status(201).json({
    message: 'Project posted successfully!',
    project,
  });
});



// --- rest of your unchanged functions ---

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  const fullProjects = projects.map((project) => ({
    ...project._doc,
    image: project.image
      ? `${req.protocol}://${req.get('host')}/uploads/${project.image}`
      : "",
  }));

  res.status(200).json(fullProjects);
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('userId', 'name email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  const fullProject = {
    ...project._doc,
    image: project.image
      ? `${req.protocol}://${req.get('host')}/uploads/${project.image}`
      : "",
  };

  res.status(200).json(fullProject);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    budget,
    skillsRequired,
    timeline,
    category,
    location,
    status,
    assignedTo,
    progress,
    completionDate,
    image,
  } = req.body;

  let project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  if (project.userId.toString() !== req.userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this project.');
  }

  project.title = title || project.title;
  project.description = description || project.description;
  project.budget = budget !== undefined ? budget : project.budget;
  project.skillsRequired = skillsRequired || project.skillsRequired;
  project.timeline = timeline || project.timeline;
  project.category = category || project.category;
  project.location = location || project.location;
  project.image = image || project.image;

  if (status) project.status = status;
  if (assignedTo) project.assignedTo = assignedTo;
  if (progress !== undefined) project.progress = progress;
  if (completionDate) project.completionDate = completionDate;

  const updatedProject = await project.save();

  res.status(200).json({
    message: 'Project updated successfully!',
    project: {
      ...updatedProject._doc,
      image: updatedProject.image
        ? `${req.protocol}://${req.get('host')}/uploads/${updatedProject.image}`
        : "",
    },
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found.');
  }

  if (project.userId.toString() !== req.userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this project.');
  }

  await Project.deleteOne({ _id: project._id });

  res.status(200).json({ message: 'Project removed successfully.' });
});

// @desc    Report a project
// @route   POST /api/projects/:id/report
// @access  Private
const reportProject = asyncHandler(async (req, res) => {
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
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  reportProject,
};
// Note: Ensure that the projectSchema includes the necessary fields like 'reports' to handle reporting functionality.
