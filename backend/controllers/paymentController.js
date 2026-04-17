const Razorpay = require('razorpay');
const crypto = require('crypto');
const Pass = require('../models/Pass');

const isDemoModeEnabled = process.env.PAYMENT_DEMO_MODE === 'true';
const isPlaceholderValue = (value) =>
  !value || /your_|YOUR_|here/i.test(value);

const hasRazorpayKeys =
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) &&
  !isPlaceholderValue(process.env.RAZORPAY_KEY_ID) &&
  !isPlaceholderValue(process.env.RAZORPAY_KEY_SECRET) &&
  process.env.RAZORPAY_KEY_ID.startsWith('rzp_');

const shouldUseDemoMode = (req) => {
  const requestFlag = req?.body?.demo === true;
  return isDemoModeEnabled || requestFlag || !hasRazorpayKeys;
};

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      'Razorpay keys are missing. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, or enable PAYMENT_DEMO_MODE=true.'
    );
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

/**
 * Create Razorpay Order for payment
 * POST /api/payment/create-order
 */
exports.createOrder = async (req, res) => {
  try {
    const { passId, amount } = req.body;

    // Validate request
    if (!passId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Pass ID and amount are required'
      });
    }

    // Find the pass
    const pass = await Pass.findById(passId).populate('userId');

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Verify pass belongs to current user
    if (pass.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This pass does not belong to you'
      });
    }

    if (shouldUseDemoMode(req)) {
      const demoOrderId = `demo_order_${Date.now()}`;

      pass.razorpayOrderId = demoOrderId;
      pass.paymentStatus = 'pending';
      await pass.save();

      return res.status(200).json({
        success: true,
        demoMode: true,
        orderId: demoOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        passId: passId,
        userEmail: pass.userId.email,
        userName: pass.userId.name,
        userPhone: pass.userId.phone,
        keyId: 'demo_key'
      });
    }

    const razorpay = getRazorpayClient();

    // Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise (smallest currency unit)
      currency: 'INR',
      receipt: `pass_${passId}_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        passId: passId.toString(),
        userId: req.user.id,
        source: pass.source,
        destination: pass.destination,
        duration: pass.duration
      }
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to pass document
    pass.razorpayOrderId = order.id;
    pass.paymentStatus = 'pending';
    await pass.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      passId: passId,
      userEmail: pass.userId.email,
      userName: pass.userId.name,
      userPhone: pass.userId.phone,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
};

/**
 * Verify Payment & Update Pass Status
 * POST /api/payment/verify-payment
 */
exports.verifyPayment = async (req, res) => {
  try {
    const demoMode = shouldUseDemoMode(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      passId
    } = req.body;

    if (!passId) {
      return res.status(400).json({
        success: false,
        message: 'Pass ID is required'
      });
    }

    // Validate request
    if (!demoMode && (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    if (!demoMode) {
      // Generate signature hash
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // Verify signature
      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed. Invalid signature.'
        });
      }
    }

    // Update pass with payment details
    const pass = await Pass.findById(passId);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Verify pass belongs to current user
    if (pass.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Update payment details and auto-approve pass after successful payment
    const paymentId = razorpay_payment_id || `demo_pay_${Date.now()}`;
    const signature = razorpay_signature || 'demo_signature';

    pass.paymentStatus = 'paid';
    if (pass.status !== 'approved') {
      pass.status = 'approved';
    }
    pass.transactionId = paymentId;
    pass.razorpayPaymentId = paymentId;
    pass.razorpaySignature = signature;
    pass.razorpayOrderId = razorpay_order_id || pass.razorpayOrderId;
    pass.paymentDate = new Date();
    pass.paymentMethod = 'razorpay';
    await pass.save();

    res.status(200).json({
      success: true,
      message: demoMode ? 'Demo payment completed successfully' : 'Payment verified successfully',
      demoMode,
      passId: passId,
      transactionId: paymentId,
      paymentStatus: 'paid',
      status: pass.status
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

/**
 * Get Payment Status
 * GET /api/payment/status/:passId
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.passId);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Verify pass belongs to current user
    if (pass.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      paymentStatus: pass.paymentStatus,
      transactionId: pass.transactionId,
      paymentDate: pass.paymentDate,
      amount: pass.price
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
};

/**
 * Handle Failed Payments
 * POST /api/payment/failed
 */
exports.handleFailedPayment = async (req, res) => {
  try {
    const { passId, error_reason } = req.body;

    const pass = await Pass.findById(passId);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    pass.paymentStatus = 'failed';
    await pass.save();

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
      passId: passId
    });
  } catch (error) {
    console.error('Error handling failed payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling payment failure',
      error: error.message
    });
  }
};
