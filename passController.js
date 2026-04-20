const Pass = require('../models/Pass');
const Route = require('../models/Route');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// @desc    Apply for new pass
// @route   POST /api/passes
// @access  Private
const applyPass = async (req, res) => {
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

    const { source, destination, duration } = req.body;

    // Find route to get price
    const route = await Route.findOne({ 
      state: 'Tamil Nadu',
      source: source.toLowerCase(), 
      destination: destination.toLowerCase(),
      isActive: true 
    });

    if (!route) {
      return res.status(400).json({
        success: false,
        message: 'Route not found or inactive'
      });
    }

    // Calculate price
    const price = Route.calculatePrice(route.basePrice, duration);

    // Process uploaded documents
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    // Create pass application
    const pass = await Pass.create({
      userId: req.user.id,
      source: source.toLowerCase(),
      destination: destination.toLowerCase(),
      duration,
      price,
      documents
    });

    // Populate user data for response
    await pass.populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Pass application submitted successfully',
      data: { pass }
    });
  } catch (error) {
    console.error('Apply pass error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting pass application'
    });
  }
};

// @desc    Get user's passes
// @route   GET /api/passes/my-passes
// @access  Private
const getMyPasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    // Keep status in sync for records paid before this rule was added.
    await Pass.updateMany(
      { userId: req.user.id, status: 'pending', paymentStatus: 'paid' },
      { $set: { status: 'approved' } }
    );

    // Build query
    const query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const passes = await Pass.find(query)
      .populate('userId', 'name email')
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pass.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        passes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get passes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching passes'
    });
  }
};

// @desc    Get single pass details
// @route   GET /api/passes/:id
// @access  Private
const getPass = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('userId', 'name email phone address');

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    // Check if user owns the pass or is admin
    if (pass.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { pass }
    });
  } catch (error) {
    console.error('Get pass error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pass'
    });
  }
};

// @desc    Get all passes (Admin only)
// @route   GET /api/passes
// @access  Private/Admin
const getAllPasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const source = req.query.source;
    const destination = req.query.destination;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (source) query.source = source.toLowerCase();
    if (destination) query.destination = destination.toLowerCase();

    const passes = await Pass.find(query)
      .populate('userId', 'name email phone')
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pass.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        passes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all passes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching passes'
    });
  }
};

const processPassStatusUpdate = async (req, res, forcedStatus = null) => {
  try {
    const status = forcedStatus || req.body.status;
    const { rejectionReason } = req.body;

    if (!['approved', 'rejected', 'active'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values are approved, rejected, and active.'
      });
    }

    const pass = await Pass.findById(req.params.id);
    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Pass not found'
      });
    }

    if (status === 'approved' || status === 'rejected') {
      if (pass.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending applications can be approved or rejected'
        });
      }
    }

    if (status === 'active' && pass.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved applications can be moved to active'
      });
    }

    if (status === 'approved' && pass.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve pass before successful payment'
      });
    }

    pass.status = status;
    if (status === 'rejected' && rejectionReason) {
      pass.rejectionReason = rejectionReason;
    } else if (status !== 'rejected') {
      pass.rejectionReason = undefined;
    }

    await pass.save();
    await pass.populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Pass ${status} successfully`,
      data: { pass }
    });
  } catch (error) {
    console.error('Update pass status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating pass status'
    });
  }
};

// @desc    Update pass status (Approve/Reject/Activate)
// @route   PUT /api/passes/:id/status
// @access  Private/Admin
const updatePassStatus = async (req, res) => {
  return processPassStatusUpdate(req, res);
};

// @desc    Approve pass
// @route   PUT /api/passes/approve/:id
// @access  Private/Admin
const approvePass = async (req, res) => {
  return processPassStatusUpdate(req, res, 'approved');
};

// @desc    Reject pass
// @route   PUT /api/passes/reject/:id
// @access  Private/Admin
const rejectPass = async (req, res) => {
  return processPassStatusUpdate(req, res, 'rejected');
};

// @desc    Activate pass
// @route   PUT /api/passes/activate/:id
// @access  Private/Admin
const activatePass = async (req, res) => {
  return processPassStatusUpdate(req, res, 'active');
};

// @desc    Get pass statistics (Admin only)
// @route   GET /api/passes/statistics
// @access  Private/Admin
const getStatistics = async (req, res) => {
  try {
    const stats = await Pass.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    const totalApplications = await Pass.countDocuments();
    const monthlyApplications = await Pass.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$applicationDate' },
            month: { $month: '$applicationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        totalApplications,
        monthlyApplications
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

module.exports = {
  applyPass,
  getMyPasses,
  getPass,
  getAllPasses,
  updatePassStatus,
  approvePass,
  rejectPass,
  activatePass,
  getStatistics
};
