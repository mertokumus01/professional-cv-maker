const crypto = require('crypto');
const logger = require('../server/utils/logger');

// Store CSRF tokens in memory (in production, use Redis)
const csrfTokens = new Map();

/**
 * Generate CSRF token for a session
 */
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF token generation middleware
 * Generates and stores token for GET requests
 */
const csrfTokenGenerator = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const token = generateCSRFToken();
    const sessionId = req.session?.id || req.ip;
    
    // Store token with expiration (30 minutes)
    csrfTokens.set(token, {
      sessionId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    // Set token in response header and cookie
    res.setHeader('X-CSRF-Token', token);
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000,
    });

    req.csrfToken = token;
  }
  next();
};

/**
 * CSRF token validation middleware
 * Validates token for state-changing requests
 */
const csrfTokenValidator = (req, res, next) => {
  // Skip validation for safe methods and health checks
  if (
    ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ||
    req.path === '/api/health'
  ) {
    return next();
  }

  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body?.csrfToken;

  if (!token) {
    logger.warn('CSRF token missing', { ip: req.ip, method: req.method, path: req.path });
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
      error: 'Forbidden',
    });
  }

  // Check if token exists and is valid
  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    logger.warn('CSRF token invalid', { ip: req.ip, method: req.method, path: req.path });
    return res.status(403).json({
      success: false,
      message: 'CSRF token invalid',
      error: 'Forbidden',
    });
  }

  // Check token expiration
  if (tokenData.expiresAt < Date.now()) {
    csrfTokens.delete(token);
    logger.warn('CSRF token expired', { ip: req.ip, method: req.method, path: req.path });
    return res.status(403).json({
      success: false,
      message: 'CSRF token expired',
      error: 'Forbidden',
    });
  }

  // Validate session/IP match
  const sessionId = req.session?.id || req.ip;
  if (tokenData.sessionId !== sessionId) {
    logger.warn('CSRF session mismatch', { ip: req.ip, method: req.method, path: req.path });
    return res.status(403).json({
      success: false,
      message: 'CSRF session mismatch',
      error: 'Forbidden',
    });
  }

  // Remove used token
  csrfTokens.delete(token);

  logger.debug('CSRF token validated', { method: req.method, path: req.path });
  next();
};

/**
 * Cleanup expired CSRF tokens periodically
 */
const cleanupExpiredTokens = () => {
  setInterval(() => {
    const now = Date.now();
    for (const [token, data] of csrfTokens.entries()) {
      if (data.expiresAt < now) {
        csrfTokens.delete(token);
      }
    }
    logger.debug('CSRF tokens cleanup completed', { remainingTokens: csrfTokens.size });
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
};

// Start cleanup on module load
cleanupExpiredTokens();

module.exports = {
  generateCSRFToken,
  csrfTokenGenerator,
  csrfTokenValidator,
};
