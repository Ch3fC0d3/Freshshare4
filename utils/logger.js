const winston = require('winston');
const path = require('path');

// Determine log level based on environment
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') return 'info';
  if (env === 'test') return 'error';
  return 'debug';
};

// Custom format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: getLogLevel(),
  format: customFormat,
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  ],
  // Don't exit on handled exceptions
  exitOnError: false
});

// Add file transport for production
if (process.env.NODE_ENV === 'production') {
  const logsDir = path.join(__dirname, '..', 'logs');
  
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
}

// Helper functions for common logging patterns
logger.logRequest = (req) => {
  if (process.env.NODE_ENV === 'production') {
    // Minimal logging in production
    logger.info(`${req.method} ${req.path}`);
  } else {
    // Detailed logging in development
    logger.debug(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }
};

logger.logAuth = (message, userId = null) => {
  if (process.env.NODE_ENV === 'production') {
    // Don't log sensitive auth details in production
    logger.info('Auth event', { userId: userId ? 'present' : 'none' });
  } else {
    logger.debug(message, { userId });
  }
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    ...context,
    stack: error.stack
  });
};

// Stream for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
