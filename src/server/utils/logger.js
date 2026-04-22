const winston = require('winston');
const path = require('path');
const config = require('../../../config/config');

const logsDir = path.join(__dirname, '../../../logs');

// ==================== Winston Logger Configuration ====================
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...args } = info;
      return `[${timestamp}] [${level.toUpperCase()}] ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          const { timestamp, level, message, ...args } = info;
          return `[${timestamp}] [${level}] ${message} ${Object.keys(args).length ? JSON.stringify(args) : ''}`;
        })
      ),
    }),
  ],
});

// Add file transport in production
if (config.logging.toFile || config.nodeEnv === 'production') {
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
  }));
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
  }));
}

module.exports = logger;
