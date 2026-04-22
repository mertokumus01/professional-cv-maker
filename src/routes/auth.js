const express = require('express');
const router = express.Router();
const logger = require('../server/utils/logger');
const { verifyToken } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');
const { generateToken, generateRefreshToken, hashPassword, comparePassword } = require('../server/utils/authUtils');
const { User } = require('../models');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validationRules.register, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    logger.info('User registration attempt:', { email });

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    logger.info('User registered successfully:', { userId: user.id, email });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', validationRules.login, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info('User login attempt:', { email });

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Invalid password attempt:', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    logger.info('User logged in successfully:', { userId: user.id, email });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', verifyToken, (req, res) => {
  try {
    logger.info('User logout:', { userId: req.user?.id });

    // TODO: Implement token blacklisting if needed

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh-token', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = require('../server/utils/authUtils').verifyToken(refreshToken, require('../../config/config').jwt.refreshSecret);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    // Generate new token
    const token = generateToken(decoded.id);

    logger.info('Token refreshed:', { userId: decoded.id });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
});

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Request password reset
 * @access  Public
 */
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    logger.info('Password reset request:', { email });

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: 'If email exists, password reset link will be sent',
      });
    }

    // TODO: Generate reset token, send email
    // For now, just log it
    logger.info('Password reset token should be sent to email:', { email });

    res.status(200).json({
      success: true,
      message: 'If email exists, password reset link will be sent',
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // TODO: Verify token, update password
    logger.info('Password reset attempt with token');

    res.status(200).json({
      success: true,
      message: 'Password reset endpoint - implementation pending',
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
    });
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify current token
 * @access  Private
 */
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: { user },
    });
  } catch (error) {
    logger.error('Token verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
    });
  }
});

module.exports = router;
