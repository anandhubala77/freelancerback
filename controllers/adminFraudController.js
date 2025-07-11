// controllers/adminFraudController.js
const Project = require("../models/projectModel");
const User = require("../models/userSchema");

const getAllFraudReports = async (req, res) => {
  try {
    const projectReports = await Project.find({ "reports.0": { $exists: true } })
      .populate("userId", "name") // hiring person
      .populate("reports.reportedBy", "name");

    const userReports = await User.find({ "reportedBy.0": { $exists: true } })
      .populate("reportedBy.reporterId", "name");

    const formattedProjectReports = projectReports.flatMap((project) =>
      project.reports.map((report) => ({
        _id: report._id,
        type: "Project",
        reportedOnId: project._id,
        projectTitle: project.title,
        reportedById: report.reportedBy?._id,
        reportedByName: report.reportedBy?.name,
        reason: report.reason,
        createdAt: report.createdAt,
      }))
    );

    const formattedUserReports = userReports.flatMap((user) =>
      user.reportedBy.map((report) => ({
        _id: report._id,
        type: "Job Seeker",
        reportedOnId: user._id,
        userName: user.name,
        reportedById: report.reporterId?._id,
        reportedByName: report.reporterId?.name,
        reason: report.reason,
        createdAt: report.reportedAt,
      }))
    );

    const allReports = [...formattedProjectReports, ...formattedUserReports];

    res.status(200).json(allReports);
  } catch (error) {
    console.error("Error fetching fraud reports:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Delete a specific fraud report (project or user)
c
module.exports = {
  getAllFraudReports,
  deleteFraudReport, // <-- Add this
};



