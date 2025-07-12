const Quotation = require('../models/quotationSchema');
const Project = require("../models/projectSchema");

const createQuotation = async (req, res) => {
  try {
    const { jobId, bidAmount, completionTime, message } = req.body;
    const existing = await Quotation.findOne({ jobId, userId: req.userId });
    if (existing) {
      return res.status(400).json({ error: "You already submitted a quotation for this job" });
    }

    if (!jobId || !bidAmount || !completionTime || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("REQ.USER_ID:", req.userId);
    console.log("REQ.USER_ROLE:", req.userRole);

    const newQuotation = new Quotation({
      jobId,
      userId: req.userId, // ✅ FIXED here
      bidAmount,
      completionTime,
      message,
    });

    await newQuotation.save();
    res.status(201).json({ message: "Quotation submitted successfully" });
  } catch (error) {
    console.error("Error submitting quotation:", error.message);
    res.status(500).json({ error: "Failed to submit quotation" });
  }
};
const getQuotationsByJobId = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const quotations = await Quotation.find({ jobId }).populate('userId', 'name email');
    res.status(200).json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error.message);
    res.status(500).json({ error: "Failed to fetch quotations" });
  }
};
 // ADD if not already imported

const updateQuotationStatus = async (req, res) => {
  const { quotationId } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updated = await Quotation.findByIdAndUpdate(
      quotationId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    // ✅ If accepted, update corresponding Project status and freelancer
    if (status === "accepted") {
      await Project.findByIdAndUpdate(updated.jobId, {
        status: "active",
        freelancer: updated.userId,
      });
    }

    res.status(200).json({ message: `Quotation ${status}`, updated });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};
// Get all quotations by the logged-in user

const getMyQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ userId: req.userId }).populate('jobId');
    res.status(200).json(quotations);
  } catch (error) {
    console.error("Error fetching my quotations:", error.message);
    res.status(500).json({ error: "Failed to fetch quotations" });
  }
};





module.exports = {
  createQuotation,
  getQuotationsByJobId,
  updateQuotationStatus,
  getMyQuotations,
};


