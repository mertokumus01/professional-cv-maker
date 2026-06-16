const helmet = require('helmet');
const logger = require('./logger');

/**
 * Security headers middleware using Helmet
 * Provides protection against common vulnerabilities
 */
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      connectSrc: ["'self'", 'https:'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
    },
  },
  // Prevent clickjacking attacks
  frameguard: {
    action: 'deny',
  },
  // Remove X-Powered-By header
  hidePoweredBy: true,
  // Prevent MIME type sniffing
  noSniff: true,
  // Enable XSS protection
  xssFilter: true,
  // Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  // Permissions Policy
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
      payment: ["'none'"],
    },
  },
});

/**
 * Additional security headers that helmet doesn't cover
 */
const additionalSecurityHeaders = (req, res, next) => {
  // Prevent browsers from guessing MIME types
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection (for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Disable client-side caching for sensitive pages
  if (req.path.includes('/api/auth') || req.path.includes('/api/profile')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Add custom security headers
  res.setHeader('X-Content-Security-Policy', "default-src 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  next();
};

/**
 * Security logging middleware
 */
const securityLogging = (req, res, next) => {
  // Log security-related requests
  if (req.path.includes('/api/auth') || req.method === 'DELETE') {
    logger.info('Security-sensitive request:', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

/**
 * Rate limiting configuration
 */
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
};

/**
 * Strict rate limiting for auth endpoints
 */
const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts to 5 per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: false,
};

module.exports = {
  securityHeaders,
  additionalSecurityHeaders,
  securityLogging,
  rateLimitConfig,
  authRateLimitConfig,
};
