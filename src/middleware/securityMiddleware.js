import express from 'express';
import { sanitizeObject } from '../utils/sanitizer.js';

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Request body size limit
export const bodyLimitMiddleware = express.json({ limit: '10mb' });

// Request validation error handler
export const validationErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      error: 'Bad Request',
    });
  }
  next();
};

// Request timeout middleware
export const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      res.status(408).json({
        success: false,
        message: 'Request timeout',
      });
    });
    next();
  };
};

// Rate limiting enhanced
export const enhancedRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    let userRequests = requests.get(key);
    userRequests = userRequests.filter(time => time > windowStart);
    requests.set(key, userRequests);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000),
      });
    }

    userRequests.push(now);
    requests.set(key, userRequests);

    res.set('X-RateLimit-Limit', maxRequests);
    res.set('X-RateLimit-Remaining', maxRequests - userRequests.length);
    res.set('X-RateLimit-Reset', new Date(userRequests[0] + windowMs).toISOString());

    next();
  };
};

export default {
  sanitizeInput,
  bodyLimitMiddleware,
  validationErrorHandler,
  requestTimeout,
  enhancedRateLimiter,
};
