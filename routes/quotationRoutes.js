const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Create a new quotation
router.post('/quotations', authenticateToken, quotationController.createQuotation);

// ✅ Get all quotations created by the logged-in user
router.get('/quotations/my', authenticateToken, quotationController.getMyQuotations);

// ✅ Get all quotations for a specific job
router.get('/quotations/job/:jobId', authenticateToken, quotationController.getQuotationsByJobId);

// ✅ Update status of a specific quotation (hiring person only)
router.patch(
  '/quotations/:quotationId/status',
  authenticateToken,
  authorizeRoles('hiringperson'),
  quotationController.updateQuotationStatus
);

module.exports = router;
