const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
  applyPass,
  getMyPasses,
  getPass,
  getAllPasses,
  updatePassStatus,
  getStatistics
} = require('../controllers/passController');

const router = express.Router();

// Validation rules
const applyPassValidation = [
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Source is required'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required'),
  body('duration')
    .isIn(['1-month', '3-months', '6-months', '1-year'])
    .withMessage('Invalid duration. Must be 1-month, 3-months, 6-months, or 1-year')
];

const updateStatusValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('rejectionReason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters')
];

// Routes
router.post('/', protect, uploadMultiple('documents', 3), applyPassValidation, applyPass);
router.get('/my-passes', protect, getMyPasses);
router.get('/statistics', protect, authorize('admin'), getStatistics);
router.get('/', protect, authorize('admin'), getAllPasses);
router.get('/:id', protect, getPass);
router.put('/:id/status', protect, authorize('admin'), updateStatusValidation, updatePassStatus);

module.exports = router;
