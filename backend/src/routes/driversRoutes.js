const express = require('express');
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createDriverSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  currentShiftHours: Joi.number().min(0).max(24).default(0),
  past7DaysWorkHours: Joi.array().items(Joi.number().min(0).max(24)).length(7).default([0,0,0,0,0,0,0])
});

const updateDriverSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  currentShiftHours: Joi.number().min(0).max(24),
  past7DaysWorkHours: Joi.array().items(Joi.number().min(0).max(24)).length(7),
  isActive: Joi.boolean()
});

// GET /api/drivers - Get all drivers
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const drivers = await Driver.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Driver.countDocuments({ isActive: true });

    res.status(200).json({
      status: 'success',
      data: drivers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve drivers'
    });
  }
});

// GET /api/drivers/:id - Get driver by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        status: 'error',
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: driver
    });

  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve driver'
    });
  }
});

// POST /api/drivers - Create new driver
router.post('/', auth, validateRequest(createDriverSchema), async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();

    res.status(201).json({
      status: 'success',
      message: 'Driver created successfully',
      data: driver
    });

  } catch (error) {
    console.error('Create driver error:', error);
    
    if (error.name === 'ValidationError') {
      const invalidFields = Object.keys(error.errors);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        invalidFields,
        details: error.errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create driver'
    });
  }
});

// PUT /api/drivers/:id - Update driver
router.put('/:id', auth, validateRequest(updateDriverSchema), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({
        status: 'error',
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Driver updated successfully',
      data: driver
    });

  } catch (error) {
    console.error('Update driver error:', error);
    
    if (error.name === 'ValidationError') {
      const invalidFields = Object.keys(error.errors);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        invalidFields,
        details: error.errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update driver'
    });
  }
});

// DELETE /api/drivers/:id - Soft delete driver
router.delete('/:id', auth, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({
        status: 'error',
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Driver deleted successfully'
    });

  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete driver'
    });
  }
});

module.exports = router;