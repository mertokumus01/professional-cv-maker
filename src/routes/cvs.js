const express = require('express');
const router = express.Router();
const logger = require('../server/utils/logger');
const { verifyToken } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');
const { CV, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * @route   GET /api/cvs
 * @desc    Get all user CVs
 * @access  Private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    logger.info('Fetching user CVs:', { userId: req.user?.id });

    const cvs = await CV.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['data'] }, // Exclude large data field for list view
    });

    res.status(200).json({
      success: true,
      message: 'CVs retrieved successfully',
      data: cvs,
      count: cvs.length,
    });
  } catch (error) {
    logger.error('Get CVs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CVs',
    });
  }
});

/**
 * @route   POST /api/cvs
 * @desc    Create a new CV
 * @access  Private
 */
router.post('/', verifyToken, validationRules.createCV, handleValidationErrors, async (req, res) => {
  try {
    const { title, template } = req.body;

    logger.info('Creating new CV:', { userId: req.user?.id, title });

    const cv = await CV.create({
      id: uuidv4(),
      userId: req.user.id,
      title,
      template: template || 'classic',
      shareLink: uuidv4(),
    });

    logger.info('CV created successfully:', { cvId: cv.id });

    res.status(201).json({
      success: true,
      message: 'CV created successfully',
      data: cv,
    });
  } catch (error) {
    logger.error('Create CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create CV',
    });
  }
});

/**
 * @route   GET /api/cvs/:id
 * @desc    Get CV details
 * @access  Private
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    logger.info('Fetching CV:', { userId: req.user?.id, cvId: req.params.id });

    const cv = await CV.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'CV retrieved successfully',
      data: cv,
    });
  } catch (error) {
    logger.error('Get CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CV',
    });
  }
});

/**
 * @route   PUT /api/cvs/:id
 * @desc    Update CV
 * @access  Private
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, data, template, isPublic } = req.body;

    logger.info('Updating CV:', { userId: req.user?.id, cvId: req.params.id });

    const cv = await CV.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    // Update CV
    if (title) cv.title = title;
    if (data) cv.data = data;
    if (template) cv.template = template;
    if (typeof isPublic !== 'undefined') cv.isPublic = isPublic;
    cv.lastModified = new Date();

    await cv.save();

    logger.info('CV updated successfully:', { cvId: cv.id });

    res.status(200).json({
      success: true,
      message: 'CV updated successfully',
      data: cv,
    });
  } catch (error) {
    logger.error('Update CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update CV',
    });
  }
});

/**
 * @route   DELETE /api/cvs/:id
 * @desc    Delete CV
 * @access  Private
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    logger.info('Deleting CV:', { userId: req.user?.id, cvId: req.params.id });

    const cv = await CV.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    await cv.destroy();

    logger.info('CV deleted successfully:', { cvId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'CV deleted successfully',
    });
  } catch (error) {
    logger.error('Delete CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete CV',
    });
  }
});

/**
 * @route   POST /api/cvs/:id/export/pdf
 * @desc    Export CV to PDF
 * @access  Private
 */
router.post('/:id/export/pdf', verifyToken, async (req, res) => {
  try {
    logger.info('Exporting CV to PDF:', { userId: req.user?.id, cvId: req.params.id });

    const cv = await CV.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    // TODO: Implement PDF generation with pdfkit/puppeteer
    logger.info('PDF export requested:', { cvId: cv.id, title: cv.title });

    res.status(200).json({
      success: true,
      message: 'PDF export endpoint - implementation pending',
    });
  } catch (error) {
    logger.error('Export PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export PDF',
    });
  }
});

/**
 * @route   GET /api/cvs/:id/share
 * @desc    Get shareable CV link
 * @access  Private
 */
router.get('/:id/share', verifyToken, async (req, res) => {
  try {
    logger.info('Getting share link for CV:', { userId: req.user?.id, cvId: req.params.id });

    const cv = await CV.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_API_URL}/cvs/public/${cv.shareLink}`;

    res.status(200).json({
      success: true,
      message: 'Share link generated',
      data: {
        shareLink: cv.shareLink,
        shareUrl,
      },
    });
  } catch (error) {
    logger.error('Get share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get share link',
    });
  }
});

/**
 * @route   GET /api/cvs/public/:shareLink
 * @desc    Get public CV (no authentication required)
 * @access  Public
 */
router.get('/public/:shareLink', async (req, res) => {
  try {
    const cv = await CV.findOne({
      where: { shareLink: req.params.shareLink, isPublic: true },
      attributes: { exclude: ['userId'] }, // Don't expose user ID
      include: {
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'profilePicture'],
      },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found or not publicly shared',
      });
    }

    // Increment view count
    cv.viewCount = (cv.viewCount || 0) + 1;
    await cv.save();

    res.status(200).json({
      success: true,
      message: 'Public CV retrieved',
      data: cv,
    });
  } catch (error) {
    logger.error('Get public CV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CV',
    });
  }
});

module.exports = router;
