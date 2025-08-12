const express = require('express');
const SimulationService = require('../services/simulationService');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const Joi = require('joi');

const router = express.Router();

// Simulation input validation schema
const simulationSchema = Joi.object({
  availableDrivers: Joi.number().integer().min(1).max(50).required()
    .messages({
      'number.min': 'Available drivers must be at least 1',
      'number.max': 'Available drivers cannot exceed 50',
      'any.required': 'Available drivers is required'
    }),
  routeStartTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
    .messages({
      'string.pattern.base': 'Route start time must be in HH:MM format (24-hour)',
      'any.required': 'Route start time is required'
    }),
  maxHoursPerDriverPerDay: Joi.number().min(1).max(16).required()
    .messages({
      'number.min': 'Max hours per driver must be at least 1',
      'number.max': 'Max hours per driver cannot exceed 16',
      'any.required': 'Max hours per driver per day is required'
    })
});

// POST /api/simulate - Run delivery simulation
router.post('/simulate', auth, validateRequest(simulationSchema), async (req, res) => {
  try {
    const { availableDrivers, routeStartTime, maxHoursPerDriverPerDay } = req.body;

    console.log(`Starting simulation with ${availableDrivers} drivers, start time: ${routeStartTime}, max hours: ${maxHoursPerDriverPerDay}`);

    const results = await SimulationService.runSimulation({
      availableDrivers,
      routeStartTime,
      maxHoursPerDriverPerDay
    });

    res.status(200).json({
      status: 'success',
      message: 'Simulation completed successfully',
      data: results
    });

  } catch (error) {
    console.error('Simulation error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Simulation failed',
      invalidFields: ['simulation']
    });
  }
});

// GET /api/simulations - Get simulation history
router.get('/simulations', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await SimulationService.getSimulationHistory(limit);

    res.status(200).json({
      status: 'success',
      data: history,
      total: history.length
    });

  } catch (error) {
    console.error('Get simulation history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve simulation history'
    });
  }
});

// GET /api/simulations/:id - Get specific simulation result
router.get('/simulations/:id', auth, async (req, res) => {
  try {
    const simulation = await SimulationService.getSimulationById(req.params.id);

    if (!simulation) {
      return res.status(404).json({
        status: 'error',
        message: 'Simulation result not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: simulation
    });

  } catch (error) {
    console.error('Get simulation by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve simulation result'
    });
  }
});

module.exports = router;