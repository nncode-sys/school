const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log('-------------------------');
  console.log('Request Details:');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Body:`, req.body);
  console.log(`Headers:`, req.headers);
  console.log('-------------------------');
  next();
});

// Base route for API health check
app.get('/api', (req, res) => {
  res.json({ message: 'API is working' });
});

// Auth routes
app.use('/api/auth', authRoutes);
console.log('Auth routes mounted at /api/auth');

// Protected routes
app.use('/api/admin', adminRoutes);
console.log('Admin routes mounted at /api/admin');

app.use('/api/client', clientRoutes);
console.log('Client routes mounted at /api/client');

// Route debugging - show all registered routes
console.log('\nRegistered Routes:');
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods);
        console.log(`${methods} ${middleware.regexp} ${path}`);
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    availableRoutes: {
      base: 'GET /api',
      auth: 'POST /api/auth/login',
      admin: '/api/admin/*',
      client: '/api/client/*'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\nServer is running on port ${PORT}`);
  console.log('\nAvailable routes:');
  console.log('- GET  /api              (Health check)');
  console.log('- GET  /api/auth         (Auth router test)');
  console.log('- POST /api/auth/login   (Login endpoint)');
  console.log('- GET  /api/admin/*      (Admin routes)');
  console.log('- GET  /api/client/*     (Client routes)');
}); 