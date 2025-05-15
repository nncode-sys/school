const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
} = require('../controllers/userController');
const { createSchool, getSchools } = require('../controllers/schoolController');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken, authorizeAdmin);

// Create user
router.post(
  '/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'client']),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('schoolId').optional().isInt(),
  ],
  createUser
);

// Update user
router.put(
  '/users/:id',
  [
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('schoolId').optional().isInt(),
    body('active').optional().isBoolean(),
  ],
  updateUser
);

// Delete user
router.delete('/users/:id', deleteUser);

// Get all users
router.get('/users', getUsers);

// Add school creation route
router.post('/schools', createSchool);

// Add get schools route
router.get('/schools', getSchools);

module.exports = router; 