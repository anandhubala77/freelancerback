const Project = require("../models/projectModel");
const User = require("../models/userSchema");
const Notification = require("../models/notificationSchema");

const getAllFraudReports = async (req, res) => {
  try {
    const projectReports = await Project.find({ "reports.0": { $exists: true } })
      .populate("userId", "name")
      .populate("reports.reportedBy", "name");

    const userReports = await User.find({ "reportedBy.0": { $exists: true } })
      .populate("reportedBy.reporterId", "name");

    const formattedProjectReports = projectReports.flatMap((project) =>
      project.reports.map((report) => ({
        reportId: report._id,
        type: "project", // ✅ consistent lowercase
        reportedOnId: project._id,
        projectTitle: project.title,
        reportedById: report.reportedBy?._id,
        reportedByName: report.reportedBy?.name,
        reason: report.reason,
        createdAt: report.createdAt,
        responseMessage: report.responseMessage || null,
        responseAt: report.responseAt || null,
      }))
    );

    const formattedUserReports = userReports.flatMap((user) =>
      user.reportedBy.map((report) => ({
        reportId: report._id,
        type: "user", // ✅ consistent lowercase
        reportedOnId: user._id,
        userName: user.name,
        reportedById: report.reporterId?._id,
        reportedByName: report.reporterId?.name,
        reason: report.reason,
        createdAt: report.reportedAt,
        responseMessage: report.responseMessage || null,
        responseAt: report.responseAt || null,
      }))
    );

    res.status(200).json({
      projectReports: formattedProjectReports,
      userReports: formattedUserReports,
    });
  } catch (error) {
    console.error("Error fetching fraud reports:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllFraudReports,
};
