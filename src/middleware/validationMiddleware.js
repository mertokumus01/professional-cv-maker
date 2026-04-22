const { body, validationResult } = require('express-validator');
const logger = require('../server/utils/logger');

/**
 * Validation Result Handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation Rules
 */
const validationRules = {
  register: [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  login: [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  createCV: [
    body('title').notEmpty().withMessage('CV title is required'),
    body('title').isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  ],
  updateProfile: [
    body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  ],
};

module.exports = {
  handleValidationErrors,
  validationRules,
};
