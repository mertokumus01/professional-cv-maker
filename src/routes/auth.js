const express = require('express');
const router = express.Router();
const logger = require('../server/utils/logger');
const { verifyToken } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
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
const { User, Session, ApiKey } = require('../models');
const crypto = require('crypto');

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
 * @desc    User login with account lockout protection
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

    // Check if account is locked
    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      const remainingTime = Math.ceil((user.accountLockedUntil - new Date()) / 1000 / 60);
      logger.warn('Account locked:', { email, remainingMinutes: remainingTime });
      return res.status(423).json({
        success: false,
        message: `Account is locked due to too many failed login attempts. Please try again in ${remainingTime} minutes.`,
      });
    }

    // Reset lock if time has passed
    if (user.accountLockedUntil && new Date() >= user.accountLockedUntil) {
      await user.update({ accountLockedUntil: null, failedLoginAttempts: 0 });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Increment failed attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const lockoutThreshold = 5;
      
      if (newFailedAttempts >= lockoutThreshold) {
        // Lock account for 15 minutes
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 15);
        await user.update({
          failedLoginAttempts: newFailedAttempts,
          accountLockedUntil: lockUntil,
        });
        
        logger.warn('Account locked after failed attempts:', { email, attempts: newFailedAttempts });
        return res.status(423).json({
          success: false,
          message: 'Too many failed login attempts. Account locked for 15 minutes.',
        });
      } else {
        // Just increment attempts
        await user.update({ failedLoginAttempts: newFailedAttempts });
        const attemptsLeft = lockoutThreshold - newFailedAttempts;
        
        logger.warn('Invalid password attempt:', { email, attempts: newFailedAttempts });
        return res.status(401).json({
          success: false,
          message: `Invalid email or password. ${attemptsLeft} attempts remaining before account lock.`,
          attemptsRemaining: attemptsLeft,
        });
      }
    }

    // Update last login and reset failed attempts
    await user.update({ 
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    });

    logger.info('User logged in successfully:', { userId: user.id, email });

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token for 2FA verification
      const tempToken = generateToken(user.id);
      
      return res.status(200).json({
        success: true,
        message: 'Please verify with 2FA code',
        data: {
          requiresOTP: true,
          tempToken,
          userId: user.id,
        },
      });
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Create session record
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours validity
    
    await Session.create({
      userId: user.id,
      token,
      refreshToken,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      expiresAt: tokenExpiry,
    });

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
 * @desc    User logout - Invalidate session
 * @access  Private
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    logger.info('User logout:', { userId });

    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Invalidate current session
      await Session.update(
        { isActive: false },
        { where: { token, userId } }
      );
    }

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

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Setup 2FA - Generate secret and QR code
 * @access  Private
 */
router.post('/2fa/setup', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled',
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `CV Maker (${user.email})`,
      issuer: 'CV Maker',
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    logger.info('2FA setup initiated:', { userId: user.id });

    res.status(200).json({
      success: true,
      message: '2FA setup initiated. Please scan the QR code.',
      data: {
        secret: secret.base32,
        qrCode,
        manualEntryKey: secret.base32,
      },
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: '2FA setup failed',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/2fa/enable
 * @desc    Enable 2FA - Verify token and save secret
 * @access  Private
 */
router.post('/2fa/enable', verifyToken, async (req, res) => {
  try {
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({
        success: false,
        message: 'Secret and token are required',
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify token
    const isTokenValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    // Enable 2FA
    await user.update({
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    });

    logger.info('2FA enabled:', { userId: user.id });

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    logger.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      message: '2FA enable failed',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
router.post('/2fa/disable', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Disable 2FA
    await user.update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    logger.info('2FA disabled:', { userId: user.id });

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    logger.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: '2FA disable failed',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/2fa/verify
 * @desc    Verify 2FA token
 * @access  Public
 */
router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: 'User ID and token are required',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled',
      });
    }

    // Verify token
    const isTokenValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2,
    });

    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    logger.info('2FA verified:', { userId: user.id });

    // Generate tokens
    const authToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      message: '2FA verified successfully',
      data: {
        token: authToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: '2FA verification failed',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/auth/sessions
 * @desc    Get all active sessions for current user
 * @access  Private
 */
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await Session.findAll({
      where: {
        userId,
        isActive: true,
      },
      attributes: { exclude: ['token', 'refreshToken'] },
      order: [['lastActivityAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      message: 'Active sessions retrieved successfully',
      data: { sessions },
    });
  } catch (error) {
    logger.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/sessions/:sessionId/revoke
 * @desc    Revoke a specific session
 * @access  Private
 */
router.post('/sessions/:sessionId/revoke', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const session = await Session.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to revoke this session',
      });
    }

    await session.update({ isActive: false });

    logger.info('Session revoked:', { userId, sessionId });

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    logger.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/sessions/revoke-all
 * @desc    Revoke all other sessions
 * @access  Private
 */
router.post('/sessions/revoke-all', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const authHeader = req.headers.authorization;
    const currentToken = authHeader && authHeader.split(' ')[1];

    // Revoke all sessions except current one
    await Session.update(
      { isActive: false },
      {
        where: {
          userId,
          token: { [require('sequelize').Op.ne]: currentToken },
        },
      }
    );

    logger.info('All other sessions revoked:', { userId });

    res.status(200).json({
      success: true,
      message: 'All other sessions revoked successfully',
    });
  } catch (error) {
    logger.error('Revoke all sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke sessions',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/api-keys/generate
 * @desc    Generate a new API key
 * @access  Private
 */
router.post('/api-keys/generate', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, permissions, expiresIn } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'API key name is required',
      });
    }

    // Generate random API key
    const apiKey = `cv_${crypto.randomBytes(32).toString('hex')}`;
    
    // Calculate expiry
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    }

    // Create API key
    const newApiKey = await ApiKey.create({
      userId,
      key: apiKey,
      name,
      permissions: permissions || ['read:cvs', 'read:profile'],
      expiresAt,
    });

    logger.info('API key generated:', { userId, keyId: newApiKey.id });

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: {
        id: newApiKey.id,
        name: newApiKey.name,
        key: apiKey, // Only shown once on generation
        permissions: newApiKey.permissions,
        expiresAt: newApiKey.expiresAt,
      },
    });
  } catch (error) {
    logger.error('Generate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/auth/api-keys
 * @desc    Get all API keys for current user
 * @access  Private
 */
router.get('/api-keys', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const apiKeys = await ApiKey.findAll({
      where: { userId },
      attributes: { exclude: ['key'] }, // Don't return full key
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      message: 'API keys retrieved successfully',
      data: { apiKeys },
    });
  } catch (error) {
    logger.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve API keys',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/auth/api-keys/:keyId
 * @desc    Delete an API key
 * @access  Private
 */
router.delete('/api-keys/:keyId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyId } = req.params;

    const apiKey = await ApiKey.findByPk(keyId);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
      });
    }

    if (apiKey.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this API key',
      });
    }

    await apiKey.destroy();

    logger.info('API key deleted:', { userId, keyId });

    res.status(200).json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    logger.error('Delete API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete API key',
      error: error.message,
    });
  }
});

/**
 * @route   PATCH /api/auth/api-keys/:keyId
 * @desc    Update an API key (permissions, active status)
 * @access  Private
 */
router.patch('/api-keys/:keyId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyId } = req.params;
    const { permissions, isActive } = req.body;

    const apiKey = await ApiKey.findByPk(keyId);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
      });
    }

    if (apiKey.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this API key',
      });
    }

    // Update fields
    if (permissions) {
      apiKey.permissions = permissions;
    }
    if (typeof isActive === 'boolean') {
      apiKey.isActive = isActive;
    }

    await apiKey.save();

    logger.info('API key updated:', { userId, keyId });

    res.status(200).json({
      success: true,
      message: 'API key updated successfully',
      data: apiKey,
    });
  } catch (error) {
    logger.error('Update API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update API key',
      error: error.message,
    });
  }
});

module.exports = router;
