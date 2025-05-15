const express = require('express');
const { authenticateToken, authorizeClient } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and client authorization to all routes
router.use(authenticateToken, authorizeClient);

// Example protected client route
router.get('/dashboard', (req, res) => {
  res.json({
    message: 'Client dashboard data',
    user: {
      id: req.user.userId,
      email: req.user.email,
      schoolId: req.user.schoolId,
    },
  });
});

module.exports = router; 