const Message = require("../models/messageSchema");
const Project = require("../models/projectSchema");
const Quotation = require("../models/quotationSchema");

// Helper to verify if a user can chat on a project
async function canAccessProjectChat(userId, projectId) {
  const project = await Project.findById(projectId).select("userId");
  if (!project) return false;

  // Hiring person eligible 
  if (project.userId.toString() === userId.toString()) {
    const hasAccepted = await Quotation.exists({ jobId: projectId, status: "accepted" });
    return !!hasAccepted;
  }

  // Jobseeker must have an accepted quotation for this project
  const accepted = await Quotation.exists({ jobId: projectId, userId, status: "accepted" });
  return !!accepted;
}

exports.getHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    if (!(await canAccessProjectChat(userId, projectId))) {
      return res.status(403).json({ message: "Not authorized for this chat" });
    }

    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const messages = await Message.find({ projectId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return res.json(messages.reverse());
  } catch (err) {
    console.error("getHistory error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { receiverId, message } = req.body;
    const senderId = req.userId;

    if (!message || !receiverId) {
      return res.status(400).json({ message: "receiverId and message are required" });
    }

    if (!(await canAccessProjectChat(senderId, projectId))) {
      return res.status(403).json({ message: "Not authorized for this chat" });
    }

    const saved = await Message.create({ projectId, senderId, receiverId, message });

    // Emit over socket.io if available
    const io = req.app.get("io");
    if (io) {
      io.to(`project:${projectId}`).emit("chat:message", saved);
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error("sendMessage error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getEligibleChats = async (req, res) => {
  try {
    const userId = req.userId;

    // As hiring person: projects I own that have accepted quotations
    const hiringProjects = await Project.aggregate([
      { $match: { userId: require("mongoose").Types.ObjectId.createFromHexString(userId) } },
      { $project: { title: 1 } },
    ]);

    // Find all projectIds where any accepted quotation exists and project belongs to user
    const acceptedForMyProjects = await Quotation.find({ status: "accepted" })
      .populate({ path: "jobId", select: "title userId" })
      .select("jobId userId");

    const eligibleAsHiring = acceptedForMyProjects
      .filter((q) => q.jobId?.userId?.toString() === userId)
      .map((q) => ({ projectId: q.jobId._id, title: q.jobId.title, partnerId: q.userId }));

    // As jobseeker my accepted quotations
    const myAccepted = await Quotation.find({ userId, status: "accepted" })
      .populate({ path: "jobId", select: "title userId" })
      .select("jobId userId");

    const eligibleAsJobseeker = myAccepted.map((q) => ({
      projectId: q.jobId._id,
      title: q.jobId.title,
      partnerId: q.jobId.userId,
    }));

    // Merge projectId 
    const map = new Map();
    [...eligibleAsHiring, ...eligibleAsJobseeker].forEach((e) => {
      map.set(e.projectId.toString(), e);
    });

    res.json(Array.from(map.values()));
  } catch (err) {
    console.error("getEligibleChats error", err);
    res.status(500).json({ message: "Server error" });
  }
};
