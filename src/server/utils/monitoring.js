const logger = require('./logger');
const os = require('os');

/**
 * Health check status
 */
let healthCheckStatus = {
  uptime: process.uptime(),
  status: 'OK',
  timestamp: new Date().toISOString(),
  checks: {},
};

/**
 * Initialize health checks
 */
const initializeHealthChecks = (sequelize) => {
  return {
    database: async () => {
      try {
        await sequelize.authenticate();
        return { status: 'healthy', message: 'Database connection OK' };
      } catch (error) {
        logger.error('Database health check failed:', error);
        return { status: 'unhealthy', message: error.message };
      }
    },
    memory: () => {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const usagePercent = (usedMemory / totalMemory) * 100;

      return {
        status: usagePercent > 80 ? 'degraded' : 'healthy',
        totalMemory: `${Math.round(totalMemory / 1024 / 1024)}MB`,
        freeMemory: `${Math.round(freeMemory / 1024 / 1024)}MB`,
        usedMemory: `${Math.round(usedMemory / 1024 / 1024)}MB`,
        usagePercent: `${usagePercent.toFixed(2)}%`,
      };
    },
    uptime: () => {
      return {
        status: 'healthy',
        uptime: `${Math.floor(process.uptime())} seconds`,
        upSinceSeconds: process.uptime(),
      };
    },
    cpuLoad: () => {
      const cpuLoad = os.loadavg();
      return {
        status: cpuLoad[0] > 4 ? 'degraded' : 'healthy',
        load1: cpuLoad[0].toFixed(2),
        load5: cpuLoad[1].toFixed(2),
        load15: cpuLoad[2].toFixed(2),
      };
    },
  };
};

/**
 * Health check endpoint middleware
 */
const healthCheckEndpoint = (healthChecks) => {
  return async (req, res) => {
    try {
      const checks = {};

      // Run all health checks
      for (const [name, checkFn] of Object.entries(healthChecks)) {
        checks[name] = await checkFn();
      }

      // Update global status
      const allHealthy = Object.values(checks).every(
        (check) => check.status === 'healthy'
      );

      healthCheckStatus = {
        uptime: process.uptime(),
        status: allHealthy ? 'OK' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        checks,
      };

      const statusCode = allHealthy ? 200 : 503;

      res.status(statusCode).json(healthCheckStatus);
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * Request/Response logging middleware
 */
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Log request
  logger.debug('Incoming request:', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();

    logger.info('Request completed:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id,
      memoryUsed: `${Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024)}KB`,
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Error tracking middleware
 */
const errorTrackingMiddleware = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  // If error is not caught by other handlers
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * Performance monitoring
 */
const performanceMetrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    avgResponseTime: 0,
  },
  endpoints: {},
};

const performanceMonitoring = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const endpoint = `${req.method} ${req.path}`;

    // Update total metrics
    performanceMetrics.requests.total++;
    if (res.statusCode >= 400) {
      performanceMetrics.requests.failed++;
    } else {
      performanceMetrics.requests.successful++;
    }

    // Calculate average response time
    const avgTime = performanceMetrics.requests.avgResponseTime;
    performanceMetrics.requests.avgResponseTime =
      (avgTime * (performanceMetrics.requests.total - 1) + duration) /
      performanceMetrics.requests.total;

    // Track per-endpoint metrics
    if (!performanceMetrics.endpoints[endpoint]) {
      performanceMetrics.endpoints[endpoint] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: duration,
        maxTime: duration,
      };
    }

    const metric = performanceMetrics.endpoints[endpoint];
    metric.count++;
    metric.totalTime += duration;
    metric.avgTime = metric.totalTime / metric.count;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
  });

  next();
};

/**
 * Get performance metrics
 */
const getPerformanceMetrics = () => {
  return performanceMetrics;
};

/**
 * Get health check status
 */
const getHealthStatus = () => {
  return healthCheckStatus;
};

module.exports = {
  initializeHealthChecks,
  healthCheckEndpoint,
  requestLoggingMiddleware,
  errorTrackingMiddleware,
  performanceMonitoring,
  getPerformanceMetrics,
  getHealthStatus,
};
