const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * MongoDB Connection for Serverless Environments
 * 
 * Key Differences from Traditional Servers:
 * 1. Connection is cached and reused across warm function invocations
 * 2. Shorter timeouts to fit within serverless function limits
 * 3. Graceful handling of connection failures
 * 4. Optimized connection pool settings for serverless
 */

let cachedConnection = null;

// Connection options optimized for serverless
const connectionOptions = {
  // Buffer commands while connecting (default: true)
  bufferCommands: false, // Fail fast in serverless instead of buffering
  
  // Maximum time to wait for connection
  serverSelectionTimeoutMS: 5000, // 5 seconds (vs default 30s)
  
  // Socket timeout
  socketTimeoutMS: 45000, // 45 seconds
  
  // Connection pool settings for serverless
  maxPoolSize: 10, // Max connections in pool
  minPoolSize: 1,  // Keep at least 1 connection warm
};

/**
 * Connect to MongoDB with serverless optimizations
 * - Reuses existing connection if available (warm start)
 * - Creates new connection if needed (cold start)
 * - Handles connection errors gracefully
 */
async function connectToDatabase() {
  // Return cached connection if available and ready
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info('Using cached MongoDB connection');
    return cachedConnection;
  }

  // Validate MongoDB URI exists
  if (!process.env.MONGODB_URI) {
    const error = new Error(
      'MONGODB_URI environment variable is not set. ' +
      'Please set it in Vercel Dashboard → Settings → Environment Variables'
    );
    logger.error(error.message);
    throw error;
  }

  try {
    logger.info('Establishing new MongoDB connection...');
    
    // Set strictQuery option (Mongoose 7+)
    mongoose.set('strictQuery', false);
    
    // Connect with serverless-optimized options
    cachedConnection = await mongoose.connect(
      process.env.MONGODB_URI,
      connectionOptions
    );

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });

    // Set up connection event handlers
    setupConnectionHandlers();

    return cachedConnection;
  } catch (error) {
    logger.error('MongoDB connection failed:', {
      error: error.message,
      mongoUri: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 
        'NOT_SET'
    });
    
    // Clear cache on error
    cachedConnection = null;
    
    throw error;
  }
}

/**
 * Setup event handlers for MongoDB connection
 */
function setupConnectionHandlers() {
  // Avoid duplicate listeners
  if (mongoose.connection.listenerCount('error') > 0) {
    return;
  }

  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('Mongoose connection error:', err);
    cachedConnection = null; // Clear cache on error
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB');
    cachedConnection = null; // Clear cache on disconnect
  });

  // Handle process termination gracefully (for local dev)
  if (process.env.NODE_ENV !== 'production') {
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed due to app termination');
      process.exit(0);
    });
  }
}

/**
 * Check if database is connected
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Get connection status details
 */
function getConnectionStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    cached: !!cachedConnection
  };
}

/**
 * Middleware to ensure database connection before handling request
 */
async function ensureDbConnection(req, res, next) {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    logger.error('Database connection failed in middleware:', error);
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Unable to connect to database. Please try again in a moment.',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message 
      })
    });
  }
}

module.exports = {
  connectToDatabase,
  isConnected,
  getConnectionStatus,
  ensureDbConnection
};

