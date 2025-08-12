const express = require('express');
const Order = require('../models/Order');
const Route = require('../models/Route');
const Driver = require('../models/Driver');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createOrderSchema = Joi.object({
  orderId: Joi.string().pattern(/^ORD\d{3}$/).required(),
  value_rs: Joi.number().min(1).max(100000).required(),
  assignedRoute: Joi.string().required(),
  deliveryTimestamp: Joi.date().iso().required(),
  customerAddress: Joi.string().max(200),
  customerPhone: Joi.string().pattern(/^\d{10}$/)
});

const updateOrderSchema = Joi.object({
  orderId: Joi.string().pattern(/^ORD\d{3}$/),
  value_rs: Joi.number().min(1).max(100000),
  assignedRoute: Joi.string(),
  deliveryTimestamp: Joi.date().iso(),
  assignedDriver: Joi.string(),
  status: Joi.string().valid('pending', 'delivered', 'late'),
  customerAddress: Joi.string().max(200),
  customerPhone: Joi.string().pattern(/^\d{10}$/)
});

// GET /api/orders - Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('assignedRoute', 'routeId distanceKm trafficLevel baseTimeMinutes')
      .populate('assignedDriver', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve orders'
    });
  }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('assignedRoute', 'routeId distanceKm trafficLevel baseTimeMinutes')
      .populate('assignedDriver', 'name');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve order'
    });
  }
});

// POST /api/orders - Create new order
router.post('/', auth, validateRequest(createOrderSchema), async (req, res) => {
  try {
    // Validate route exists
    const route = await Route.findById(req.body.assignedRoute);
    if (!route) {
      return res.status(400).json({
        status: 'error',
        message: 'Assigned route not found',
        invalidFields: ['assignedRoute']
      });
    }

    const order = new Order(req.body);
    await order.save();

    // Populate the saved order
    await order.populate('assignedRoute', 'routeId distanceKm trafficLevel baseTimeMinutes');

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID already exists',
        invalidFields: ['orderId']
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
      message: 'Failed to create order'
    });
  }
});

// PUT /api/orders/:id - Update order
router.put('/:id', auth, validateRequest(updateOrderSchema), async (req, res) => {
  try {
    // Validate route exists if provided
    if (req.body.assignedRoute) {
      const route = await Route.findById(req.body.assignedRoute);
      if (!route) {
        return res.status(400).json({
          status: 'error',
          message: 'Assigned route not found',
          invalidFields: ['assignedRoute']
        });
      }
    }

    // Validate driver exists if provided
    if (req.body.assignedDriver) {
      const driver = await Driver.findById(req.body.assignedDriver);
      if (!driver) {
        return res.status(400).json({
          status: 'error',
          message: 'Assigned driver not found',
          invalidFields: ['assignedDriver']
        });
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedRoute', 'routeId distanceKm trafficLevel baseTimeMinutes')
     .populate('assignedDriver', 'name');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Order updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update order error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID already exists',
        invalidFields: ['orderId']
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
      message: 'Failed to update order'
    });
  }
});

// DELETE /api/orders/:id - Delete order
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete order'
    });
  }
});

module.exports = router;