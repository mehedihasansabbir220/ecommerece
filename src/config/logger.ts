import winston from 'winston';

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Default level
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console(),
    // File transport for errors
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // File transport for combined logs
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// For non-production environments, enable console logging with detailed info
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

export default logger;
