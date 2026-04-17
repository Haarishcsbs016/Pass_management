const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  calculatePrice
} = require('../controllers/routeController');

const router = express.Router();

// Validation rules
const createRouteValidation = [
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Source is required')
    .isLength({ max: 50 })
    .withMessage('Source cannot exceed 50 characters'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ max: 50 })
    .withMessage('Destination cannot exceed 50 characters'),
  body('basePrice')
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base price must be positive'),
  body('distance')
    .isNumeric()
    .withMessage('Distance must be a number')
    .isFloat({ min: 0 })
    .withMessage('Distance must be positive'),
  body('estimatedTime')
    .trim()
    .notEmpty()
    .withMessage('Estimated time is required'),
  body('routeType')
    .optional()
    .isIn(['bus', 'metro', 'train', 'combined'])
    .withMessage('Invalid route type')
];

const updateRouteValidation = [
  body('source')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Source cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Source cannot exceed 50 characters'),
  body('destination')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Destination cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Destination cannot exceed 50 characters'),
  body('basePrice')
    .optional()
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base price must be positive'),
  body('distance')
    .optional()
    .isNumeric()
    .withMessage('Distance must be a number')
    .isFloat({ min: 0 })
    .withMessage('Distance must be positive'),
  body('estimatedTime')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Estimated time cannot be empty'),
  body('routeType')
    .optional()
    .isIn(['bus', 'metro', 'train', 'combined'])
    .withMessage('Invalid route type'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const calculatePriceValidation = [
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

// Routes
router.get('/', getAllRoutes);
router.get('/calculate-price', calculatePriceValidation, calculatePrice);
router.post('/', protect, authorize('admin'), createRouteValidation, createRoute);
router.get('/:id', getRoute);
router.put('/:id', protect, authorize('admin'), updateRouteValidation, updateRoute);
router.delete('/:id', protect, authorize('admin'), deleteRoute);

module.exports = router;
