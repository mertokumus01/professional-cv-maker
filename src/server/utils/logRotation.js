/**
 * Log Rotation Configuration for Winston
 * Implements daily log rotation and cleanup
 */

const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

/**
 * Create daily rotate file transport
 */
const createDailyRotateTransport = (filename, level = 'info') => {
  const logsDir = path.join(__dirname, '../../../logs');

  return new DailyRotateFile({
    filename: path.join(logsDir, filename),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxDays: 14, // Keep logs for 14 days
    zippedArchive: true, // Compress old logs
    format: require('winston').format.combine(
      require('winston').format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      require('winston').format.errors({ stack: true }),
      require('winston').format.printf((info) => {
        const { timestamp, level, message, ...args } = info;
        return `[${timestamp}] [${level.toUpperCase()}] ${message} ${
          Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
        }`;
      })
    ),
    level,
  });
};

/**
 * Get log rotation transports
 */
const getLogRotationTransports = () => {
  return [
    createDailyRotateTransport('error-%DATE%.log', 'error'),
    createDailyRotateTransport('combined-%DATE%.log', 'info'),
    createDailyRotateTransport('access-%DATE%.log', 'info'),
  ];
};

module.exports = {
  createDailyRotateTransport,
  getLogRotationTransports,
};
