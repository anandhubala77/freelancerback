const Project = require("../models/projectSchema");
const Quotation = require("../models/quotationSchema"); // use this
const User = require("../models/userSchema");
const HireRequest = require("../models/HireRequestSchema");
// if you need it for populate

// GET /api/applications/hiring
const getApplicationsForHiringPerson = async (req, res) => {
  try {
    const hiringPersonId = req.userId;

    const projects = await Project.find({ userId: hiringPersonId }).select("_id");
    const projectIds = projects.map(p => p._id);

    const quotations = await Quotation.find({ jobId: { $in: projectIds }, status: { $ne: "withdrawn" } })
      .populate("userId", "name email skills experience")
      .populate("jobId", "title");

    res.status(200).json(quotations);
  } catch (err) {
    console.error("Error fetching quotations:", err);
    res.status(500).json({ message: "Error fetching quotations" });
  }
};

// PATCH /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Quotation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("jobId");

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getApplicationsForJobSeeker = async (req, res) => {
  try {
    const applications = await Quotation.find({ userId: req.params.id })
      .populate("jobId", "title");
    res.status(200).json(applications);
  } catch (err) {
    console.error("Error fetching job seeker applications:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// PATCH /api/applications/:id/withdraw
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Quotation.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "withdrawn";
    await application.save();

    res.status(200).json({ message: "Application withdrawn successfully", application });
  } catch (err) {
    console.error("Error withdrawing application:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const submitCompletedWork = async (req, res) => {
  const { link, message } = req.body;
  const quotationId = req.params.id;

  console.log("🔥 HIT submitCompletedWork route");
  console.log("quotationId:", quotationId);
  console.log("userId from token:", req.userId);
  console.log("body:", req.body);

  try {
    const quotation = await Quotation.findById(quotationId);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // Authorization check
    if (quotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    quotation.submission = {
      link,
      message,
      submittedAt: new Date(),
    };

    await quotation.save();

    res.status(200).json({ message: "Work submitted successfully", quotation });
  } catch (error) {
    console.error("❌ Error in submitCompletedWork:", error);
    res.status(500).json({ message: "Server error. Failed to submit work." });
  }
};
// controllers/applicationController.js

const approveSubmission = async (req, res) => {
  const { submissionId } = req.params;

  const application = await Application.findOne({ "submission._id": submissionId });

  if (!application) return res.status(404).json({ message: "Submission not found" });

  application.submission.status = "approved";
  await application.save();

  res.json({ message: "Submission approved." });
};

const requestChanges = async (req, res) => {
  const { submissionId } = req.params;

  const application = await Application.findOne({ "submission._id": submissionId });

  if (!application) return res.status(404).json({ message: "Submission not found" });

  application.submission.status = "changes_requested";
  await application.save();

  res.json({ message: "Changes requested." });
};






module.exports = { getApplicationsForHiringPerson,approveSubmission, requestChanges, updateApplicationStatus, getApplicationsForJobSeeker, withdrawApplication, submitCompletedWork, };
