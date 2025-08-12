const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// In-memory manager store (for demo purposes - in production, use a proper User model)
const managers = new Map();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Helper function to generate JWT
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// POST /api/auth/register - Register a new manager
router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if manager already exists
    if (managers.has(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Manager with this email already exists',
        invalidFields: ['email']
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store manager
    const manager = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role: 'manager',
      createdAt: new Date()
    };

    managers.set(email, manager);

    // Generate token
    const token = generateToken(manager.id, email);

    res.status(201).json({
      status: 'success',
      message: 'Manager registered successfully',
      data: {
        token,
        manager: {
          id: manager.id,
          email: manager.email,
          name: manager.name,
          role: manager.role
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    });
  }
});

// POST /api/auth/login - Manager login
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find manager
    const manager = managers.get(email);
    if (!manager) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        invalidFields: ['email', 'password']
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, manager.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        invalidFields: ['email', 'password']
      });
    }

    // Generate token
    const token = generateToken(manager.id, email);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        manager: {
          id: manager.id,
          email: manager.email,
          name: manager.name,
          role: manager.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const manager = managers.get(decoded.email);

    if (!manager) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        manager: {
          id: manager.id,
          email: manager.email,
          name: manager.name,
          role: manager.role
        }
      }
    });

  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

module.exports = router;