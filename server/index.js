require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');
const { connectToDatabase, ensureDbConnection, getConnectionStatus } = require('./utils/database');

// Import routes
const authRoutes = require('./routes/auth');
const ondcRoutes = require('./routes/ondc');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const webhookRoutes = require('./routes/webhooks');

const app = express();

// Trust proxy - CRITICAL for Vercel/AWS/any reverse proxy
// This allows Express to trust X-Forwarded-* headers
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection - handled per request in serverless
// Connection is established lazily and cached for warm starts

// Health check endpoint (doesn't require DB)
app.get('/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbStatus.state,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection check endpoint
app.get('/api/health/db', ensureDbConnection, (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Ensure database connection for all API routes
// This middleware connects to DB before processing requests
app.use('/api/', ensureDbConnection);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ondc', ondcRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel serverless
module.exports = app;

