const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post('/quotations', authenticateToken, quotationController.createQuotation);
router.get('/quotations/:jobId', authenticateToken, quotationController.getQuotationsByJobId);

// routes/quotationRoutes.js

router.patch('/quotations/:quotationId/status', authenticateToken, authorizeRoles('hiringperson'), quotationController.updateQuotationStatus);

module.exports = router;
