const express = require('express');
const Route = require('../models/Route');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createRouteSchema = Joi.object({
  routeId: Joi.string().pattern(/^RT\d{3}$/).required(),
  distanceKm: Joi.number().min(0.1).max(1000).required(),
  trafficLevel: Joi.string().valid('Low', 'Medium', 'High').required(),
  baseTimeMinutes: Joi.number().min(5).max(480).required(),
  description: Joi.string().max(200)
});

const updateRouteSchema = Joi.object({
  routeId: Joi.string().pattern(/^RT\d{3}$/),
  distanceKm: Joi.number().min(0.1).max(1000),
  trafficLevel: Joi.string().valid('Low', 'Medium', 'High'),
  baseTimeMinutes: Joi.number().min(5).max(480),
  description: Joi.string().max(200),
  isActive: Joi.boolean()
});

// GET /api/routes - Get all routes
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const routes = await Route.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Route.countDocuments({ isActive: true });

    res.status(200).json({
      status: 'success',
      data: routes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve routes'
    });
  }
});

// GET /api/routes/:id - Get route by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: route
    });

  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve route'
    });
  }
});

// POST /api/routes - Create new route
router.post('/', auth, validateRequest(createRouteSchema), async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();

    res.status(201).json({
      status: 'success',
      message: 'Route created successfully',
      data: route
    });

  } catch (error) {
    console.error('Create route error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Route ID already exists',
        invalidFields: ['routeId']
      });
    }

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
      message: 'Failed to create route'
    });
  }
});

// PUT /api/routes/:id - Update route
router.put('/:id', auth, validateRequest(updateRouteSchema), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Route updated successfully',
      data: route
    });

  } catch (error) {
    console.error('Update route error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Route ID already exists',
        invalidFields: ['routeId']
      });
    }

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
      message: 'Failed to update route'
    });
  }
});

// DELETE /api/routes/:id - Soft delete route
router.delete('/:id', auth, async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Route deleted successfully'
    });

  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete route'
    });
  }
});

module.exports = router;