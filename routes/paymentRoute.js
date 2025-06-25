const express = require('express');
const Payment = require("../models/paymentSchema");
const router = express.Router();
const {
  createPaymentOrder,
  markPaymentSuccess,
  getReceivedPayments,
  // getSentPayments,
  getSentPaymentsHiring,
} = require('../controllers/paymentController');

router.post('/payment/create-order', createPaymentOrder);
router.post('/payment/mark-success', markPaymentSuccess);

router.get("/payment/received/:freelancerId", getReceivedPayments);

// router.get("/payment/sent/:hiringPersonId", getSentPayments);

router.get('/payment/sent/:userId', getSentPaymentsHiring);

module.exports = router;


