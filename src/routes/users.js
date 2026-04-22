const express = require('express');
const router = express.Router();
const logger = require('../server/utils/logger');
const { verifyToken } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');
const { User } = require('../models');
const { comparePassword, hashPassword } = require('../server/utils/authUtils');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    logger.info('Fetching user profile:', { userId: req.user?.id });

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
      message: 'Profile retrieved successfully',
      data: { user },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', verifyToken, validationRules.updateProfile, handleValidationErrors, async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, bio } = req.body;

    logger.info('Updating user profile:', { userId: req.user?.id });

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.bio = bio;

    await user.save();

    logger.info('User profile updated successfully:', { userId: user.id });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.dataValues,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    logger.info('Changing user password:', { userId: req.user?.id });

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;

    await user.save();

    logger.info('User password changed successfully:', { userId: user.id });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
});

/**
 * @route   POST /api/users/upload-picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/upload-picture', verifyToken, async (req, res) => {
  try {
    logger.info('Uploading profile picture:', { userId: req.user?.id });

    // TODO: Implement file upload with multer
    // For now, just return placeholder

    res.status(200).json({
      success: true,
      message: 'Upload picture endpoint - implementation pending',
    });
  } catch (error) {
    logger.error('Upload picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload picture',
    });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account',
      });
    }

    logger.info('Account deletion requested:', { userId: req.user?.id });

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
        message: 'Incorrect password',
      });
    }

    // TODO: Delete all associated CVs and data first (cascade)
    await user.destroy();

    logger.info('User account deleted:', { userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
});

module.exports = router;
