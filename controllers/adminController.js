const Project = require("../models/projectSchema");
const User = require("../models/userSchema");
const razorpay = require("../utils/razorpay");
const Quotation = require("../models/quotationSchema");
const Payment = require("../models/paymentSchema");

// GET /admin/projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("userId", "name lastName") // who posted
      .populate("reports.reportedBy", "name"); // who reported

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
    const users = await User.find({ role: { $ne: "admin" } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
// controllers/adminController.js
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
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

// GET all project reports and user reports for admin
exports.getFraudReports = async (req, res) => {
  try {
    // --- 1. Fetch Project Reports ---
    const projectsWithReports = await Project.find({
      "reports.0": { $exists: true },
    }).select("_id reports");

    const projectReports = projectsWithReports.flatMap((project) =>
      project.reports.map((report) => ({
        reportId: report._id,
        projectId: project._id,
        reportedBy: report.reportedBy,
        reason: report.reason,
        createdAt: report.createdAt,
        type: "Project", // 👈 Add this for frontend filtering
      }))
    );

    // --- 2. Fetch Jobseeker Reports ---
    const usersWithReports = await User.find({
      role: "jobseeker",
      "reportedBy.0": { $exists: true },
    }).select("_id reportedBy");

    const userReports = usersWithReports.flatMap((user) =>
      user.reportedBy.map((report) => ({
        reportId: report._id, // ✅ Include this for delete endpoint
        jobseekerId: user._id,
        reportedBy: report.reporterId,
        reason: report.reason,
        createdAt: report.reportedAt,
        type: "Job Seeker", // 👈 Add this for frontend filtering
      }))
    );

    return res.status(200).json({ projectReports, userReports });
  } catch (error) {
    console.error("Error fetching fraud reports:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.deleteFraudReport = async (req, res) => {
  const { type, reportedOnId, reportId } = req.params;

  try {
    if (type === "project") {
      await Project.updateOne(
        { _id: reportedOnId },
        { $pull: { reports: { _id: reportId } } }
      );
    } else if (type === "users") {
      await User.updateOne(
        { _id: reportedOnId },
        { $pull: { reportedBy: { _id: reportId } } }
      );
    } else {
      return res.status(400).json({ message: "Invalid report type" });
    }

    res.status(200).json({ message: "Fraud report deleted successfully" });
  } catch (error) {
    console.error("Error deleting fraud report:", error);
    res.status(500).json({ message: "Failed to delete fraud report" });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    const imagePath = req.file.path;

    const user = await User.findByIdAndUpdate(
      userId,
      { profile: imagePath },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully!",
      user_data: user,
    });
  } catch (err) {
    console.error("Profile upload error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } }); // ✅ excludes admins
    const jobSeekers = await User.countDocuments({ role: "jobseeker" });
    const hiringPersons = await User.countDocuments({ role: "hiringperson" });

    const totalProjects = await Project.countDocuments();

    const reportedProjects = await Project.countDocuments({
      "reports.0": { $exists: true },
    });
    const reportedUsers = await User.countDocuments({
      "reportedBy.0": { $exists: true },
    });

    const fraudReports = reportedProjects + reportedUsers;

    return res.status(200).json({
      totalUsers,
      totalProjects,
      fraudReports,
      jobSeekers,
      hiringPersons,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Failed to fetch admin statistics." });
  }
};

// GET /admin/dashboard-metrics
exports.getAdminDashboardMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const jobSeekers = await User.countDocuments({ role: "jobseeker" });
    const hiringPersons = await User.countDocuments({ role: "hiring" });

    const fraudReports = await Project.aggregate([
      { $match: { reports: { $exists: true, $not: { $size: 0 } } } },
      { $count: "count" },
    ]);

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title budget status");

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name lastName role");

    const recentBids = await Quotation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .populate("jobId", "title");

    const recentPayments = await Payment.find()
      .sort({ paidAt: -1 })
      .limit(5)
      .populate("paidBy", "name email")
      .populate("paidTo", "name email")
      .populate("jobId", "title");

    // Monthly Payments Aggregation
    const monthlyPayments = await Payment.aggregate([
      {
        $group: {
          _id: { $month: "$paidAt" },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          month: {
            $arrayElemAt: [
              [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              { $subtract: ["$_id", 1] },
            ],
          },
          amount: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    // Yearly Payments Aggregation
    const yearlyPayments = await Payment.aggregate([
      {
        $group: {
          _id: { $year: "$paidAt" },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          year: "$_id",
          amount: 1,
          _id: 0,
        },
      },
      { $sort: { year: 1 } },
    ]);

    res.status(200).json({
      totalUsers,
      totalProjects,
      jobSeekers,
      hiringPersons,
      fraudReports: fraudReports[0]?.count || 0,
      recentProjects,
      recentUsers,
      recentBids,
      recentPayments,
      monthlyPayments,
      yearlyPayments,
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard metrics" });
  }
};

// controller
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("jobId", "title")
      .populate("paidBy", "name email")
      .populate("paidTo", "name email");
    if (!payment) return res.status(404).json({ message: "Not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payment", error: err });
  }
};
