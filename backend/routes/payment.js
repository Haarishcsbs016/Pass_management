const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  handleFailedPayment
} = require('../controllers/paymentController');

// All payment routes are protected (require authentication)

/**
 * POST /api/payment/create-order
 * Create Razorpay order for pass payment
 * Body: { passId, amount }
 */
router.post('/create-order', protect, createOrder);

/**
 * POST /api/payment/verify-payment
 * Verify payment and update pass status to paid
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, passId }
 */
router.post('/verify-payment', protect, verifyPayment);

/**
 * GET /api/payment/status/:passId
 * Get payment status for a pass
 * Params: passId
 */
router.get('/status/:passId', protect, getPaymentStatus);

/**
 * POST /api/payment/failed
 * Handle failed payment attempt
 * Body: { passId, error_reason }
 */
router.post('/failed', protect, handleFailedPayment);

module.exports = router;
