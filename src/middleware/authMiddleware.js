const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const logger = require('../server/utils/logger');

/**
 * Verify JWT Token Middleware
 */
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    res.status(403).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

/**
 * Optional Token Middleware (doesn't fail if no token)
 */
const optionalToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
    }

    next();
  } catch (error) {
    logger.warn('Optional token verification failed:', error.message);
    next(); // Continue anyway
  }
};

/**
 * Check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }
  next();
};

module.exports = {
  verifyToken,
  optionalToken,
  isAuthenticated,
};
