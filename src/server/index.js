const http = require('http');
require('dotenv').config();

const app = require('./app');
const config = require('../../config/config');
const logger = require('./utils/logger');

// TODO: Database connection setup
// const { sequelize } = require('../models');

const server = http.createServer(app);

const PORT = config.port;

// ==================== Server Startup ====================
server.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`📝 API Base URL: http://localhost:${PORT}/api`);
  
  // TODO: Connect to database
  // sequelize.sync({ alter: config.nodeEnv === 'development' })
  //   .then(() => logger.info('📊 Database synchronized'))
  //   .catch((err) => logger.error('Database sync error:', err));
});

// ==================== Graceful Shutdown ====================
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// ==================== Unhandled Rejection Handler ====================
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
