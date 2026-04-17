const Route = require('../models/Route');
const { validationResult } = require('express-validator');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getAllRoutes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const source = req.query.source;
    const destination = req.query.destination;

    // Build query
    const query = { isActive: true, state: 'Tamil Nadu' };
    if (source) query.source = source.toLowerCase();
    if (destination) query.destination = destination.toLowerCase();

    const routes = await Route.find(query)
      .sort({ source: 1, destination: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Route.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        routes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching routes'
    });
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
const getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { route }
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching route'
    });
  }
};

// @desc    Create new route (Admin only)
// @route   POST /api/routes
// @access  Private/Admin
const createRoute = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { source, destination, basePrice, distance, estimatedTime, routeType, stops } = req.body;

    // Check if route already exists
    const existingRoute = await Route.findOne({ 
      state: 'Tamil Nadu',
      source: source.toLowerCase(), 
      destination: destination.toLowerCase() 
    });

    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Route already exists'
      });
    }

    // Create route
    const route = await Route.create({
      state: 'Tamil Nadu',
      source: source.toLowerCase(),
      destination: destination.toLowerCase(),
      basePrice,
      distance,
      estimatedTime,
      routeType,
      stops
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: { route }
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating route'
    });
  }
};

// @desc    Update route (Admin only)
// @route   PUT /api/routes/:id
// @access  Private/Admin
const updateRoute = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const { source, destination, basePrice, distance, estimatedTime, routeType, stops, isActive } = req.body;

    // Update fields
    route.state = 'Tamil Nadu';
    if (source) route.source = source.toLowerCase();
    if (destination) route.destination = destination.toLowerCase();
    if (basePrice !== undefined) route.basePrice = basePrice;
    if (distance !== undefined) route.distance = distance;
    if (estimatedTime) route.estimatedTime = estimatedTime;
    if (routeType) route.routeType = routeType;
    if (stops) route.stops = stops;
    if (isActive !== undefined) route.isActive = isActive;

    await route.save();

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      data: { route }
    });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating route'
    });
  }
};

// @desc    Delete route (Admin only)
// @route   DELETE /api/routes/:id
// @access  Private/Admin
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Soft delete by setting isActive to false
    route.isActive = false;
    await route.save();

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting route'
    });
  }
};

// @desc    Calculate pass price
// @route   POST /api/routes/calculate-price
// @access  Public
const calculatePrice = async (req, res) => {
  try {
    const { source, destination, duration } = req.body;

    if (!source || !destination || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Source, destination, and duration are required'
      });
    }

    const route = await Route.findOne({ 
      state: 'Tamil Nadu',
      source: source.toLowerCase(), 
      destination: destination.toLowerCase(),
      isActive: true 
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    const price = Route.calculatePrice(route.basePrice, duration);

    res.status(200).json({
      success: true,
      data: {
        route: {
          source: route.source,
          destination: route.destination,
          basePrice: route.basePrice,
          distance: route.distance,
          estimatedTime: route.estimatedTime
        },
        duration,
        calculatedPrice: price
      }
    });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating price'
    });
  }
};

module.exports = {
  getAllRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  calculatePrice
};
