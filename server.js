const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const budgetRoutes = require('./src/routes/budgetRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
// Import database and routes
const { syncDatabase } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionroutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const goalRoutes = require('./src/routes/goalroutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Budget Planner API working!',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
const startServer = async () => {
  try {
    await syncDatabase();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Test URL: http://localhost:${PORT}/api/test`);
      console.log(`🔐 Auth endpoints:`);
      console.log(`   POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

startServer();