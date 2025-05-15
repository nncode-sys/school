const express = require('express');
const { body } = require('express-validator');
const { login } = require('../controllers/authController');

const router = express.Router();

// Debug route to verify router is working
router.get('/', (req, res) => {
  res.json({ message: 'Auth router is working' });
});

// Login route - note this will be accessible at /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

// Export the router
module.exports = router; 