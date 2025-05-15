const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};

const authorizeClient = (req, res, next) => {
  if (!req.user || req.user.role !== 'client') {
    return res.status(403).json({ message: 'Access denied: Client privileges required' });
  }
  next();
};

const authorizeSchoolAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Admins can access all schools
  if (req.user.role === 'admin') {
    return next();
  }

  // Clients can only access their own school
  const requestedSchoolId = parseInt(req.params.schoolId || req.body.schoolId);
  if (!requestedSchoolId || requestedSchoolId !== req.user.schoolId) {
    return res.status(403).json({ message: 'Access denied: Invalid school access' });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeClient,
  authorizeSchoolAccess,
}; 