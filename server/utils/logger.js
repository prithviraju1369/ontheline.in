const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Determine if we're in a serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Create transports array based on environment
const transports = [];

// In serverless environments, ONLY use console transport
// Vercel/AWS capture stdout/stderr for logging
if (isServerless || process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  );
} else {
  // Local development: use file transports
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log') 
    })
  );

  // Also add colorized console output for development
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports
});

// Add helpful metadata in serverless environments
if (isServerless) {
  logger.defaultMeta = {
    environment: 'serverless',
    platform: process.env.VERCEL ? 'vercel' : 'aws-lambda'
  };
}

module.exports = logger;

