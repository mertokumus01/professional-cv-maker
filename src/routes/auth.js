const express = require('express');
const router = express.Router();
const logger = require('../server/utils/logger');
const { verifyToken } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');
const { 
  generateToken, 
  generateRefreshToken, 
  hashPassword, 
  comparePassword,
  generateVerificationToken,
  generateResetToken,
  verifyToken: verifyJWT
} = require('../server/utils/authUtils');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../server/utils/emailService');
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

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user with verification token
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerificationToken: verificationToken,
      isEmailVerified: false,
    });

    logger.info('User registered successfully:', { userId: user.id, email });

    // Send verification email
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    await sendVerificationEmail(email, firstName, verificationToken, baseUrl);

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
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
    const decoded = verifyJWT(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');

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
 * @route   GET /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Find user with verification token
    const user = await User.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Update user
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
    });

    logger.info('Email verified successfully:', { userId: user.id, email: user.email });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Private
 */
router.post('/resend-verification', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    await user.update({ emailVerificationToken: verificationToken });

    // Send verification email
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    await sendVerificationEmail(user.email, user.firstName, verificationToken, baseUrl);

    logger.info('Verification email resent:', { userId: user.id, email: user.email });

    res.status(200).json({
      success: true,
      message: 'Verification email sent. Please check your email.',
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
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

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

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

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });

    // Send reset email
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    await sendPasswordResetEmail(user.email, user.firstName, resetToken, baseUrl);

    logger.info('Password reset email sent:', { email });

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
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, new password and confirmation are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Find user with reset token
    const user = await User.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Check token expiry
    if (user.passwordResetExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token has expired',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user
    await user.update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    });

    logger.info('Password reset successfully:', { userId: user.id, email: user.email });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
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

/**
 * @route   POST /api/auth/google-callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.post('/google-callback', async (req, res) => {
  try {
    const { email, firstName, lastName, googleId, profilePicture } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Email and Google ID are required',
      });
    }

    logger.info('Google OAuth callback:', { email });

    // Find or create user
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Update user if it doesn't have social provider info
      if (!user.googleId) {
        await user.update({ googleId, profilePicture, isEmailVerified: true });
      }
    } else {
      // Create new user from Google OAuth
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      user = await User.create({
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        password: hashedPassword,
        googleId,
        profilePicture,
        isEmailVerified: true,
        emailVerificationToken: null,
      });

      logger.info('User created via Google OAuth:', { userId: user.id, email });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Google callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/github-callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.post('/github-callback', async (req, res) => {
  try {
    const { email, firstName, lastName, githubId, profilePicture, username } = req.body;

    if (!email || !githubId) {
      return res.status(400).json({
        success: false,
        message: 'Email and GitHub ID are required',
      });
    }

    logger.info('GitHub OAuth callback:', { email });

    // Find or create user
    let user = await User.findOne({ where: { email } });

    if (user) {
      // Update user if it doesn't have social provider info
      if (!user.githubId) {
        await user.update({ githubId, profilePicture, isEmailVerified: true });
      }
    } else {
      // Create new user from GitHub OAuth
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      user = await User.create({
        email,
        firstName: firstName || username || 'User',
        lastName: lastName || '',
        password: hashedPassword,
        githubId,
        profilePicture,
        isEmailVerified: true,
        emailVerificationToken: null,
      });

      logger.info('User created via GitHub OAuth:', { userId: user.id, email });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: 'GitHub login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('GitHub callback error:', error);
    res.status(500).json({
      success: false,
      message: 'GitHub login failed',
      error: error.message,
    });
  }
});

module.exports = router;
