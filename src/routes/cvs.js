const express = require('express');
const router = express.Router();
const logger = require('../server/utils/logger');
const { verifyToken } = require('../middleware/authMiddleware');
const { validationRules, handleValidationErrors } = require('../middleware/validationMiddleware');
const { CV, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { generateCVPDF } = require('../server/utils/pdfService');
const { generateCVDOCX, generateCVCSV, generateCVJSON } = require('../server/utils/exportService');
const path = require('path');
const fs = require('fs');

/**
 * @route   GET /api/cvs
 * @desc    Get all user CVs with pagination
 * @access  Private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { limit = 10, offset = 0, page = 1 } = req.query;
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNum = Math.min(parseInt(limit) || 10, 100); // Max 100
    const offsetNum = (pageNum - 1) * limitNum;

    logger.info('Fetching user CVs:', { userId: req.user?.id, page: pageNum, limit: limitNum });

    const { count, rows: cvs } = await CV.findAndCountAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['data'] }, // Exclude large data field for list view
      limit: limitNum,
      offset: offsetNum,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      message: 'CVs retrieved successfully',
      data: cvs,
      pagination: {
        total: count,
        count: cvs.length,
        perPage: limitNum,
        currentPage: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
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
 * @route   GET /api/cvs/search
 * @desc    Search and filter user CVs
 * @access  Private
 */
router.get('/search', verifyToken, async (req, res) => {
  try {
    const {
      q = '',
      template,
      skills,
      createdDateFrom,
      createdDateTo,
      limit = 10,
      page = 1,
    } = req.query;

    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNum = Math.min(parseInt(limit) || 10, 100);
    const offsetNum = (pageNum - 1) * limitNum;

    logger.info('Searching CVs:', { userId: req.user?.id, query: q, page: pageNum });

    // Build where clause
    const where = { userId: req.user.id };

    // Search by title or template
    if (q && q.trim()) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
      ];
    }

    // Filter by template
    if (template && template.trim()) {
      where.template = template;
    }

    // Filter by creation date
    if (createdDateFrom || createdDateTo) {
      const { Op } = require('sequelize');
      where.createdAt = {};

      if (createdDateFrom) {
        where.createdAt[Op.gte] = new Date(createdDateFrom);
      }

      if (createdDateTo) {
        const endDate = new Date(createdDateTo);
        endDate.setDate(endDate.getDate() + 1); // Include the entire day
        where.createdAt[Op.lt] = endDate;
      }
    }

    // Find CVs
    const { count, rows: cvs } = await CV.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['data'] },
      limit: limitNum,
      offset: offsetNum,
    });

    const totalPages = Math.ceil(count / limitNum);

    // Filter by skills if requested (client-side filtering for now)
    let filteredCVs = cvs;
    if (skills && Array.isArray(skills)) {
      filteredCVs = cvs.filter((cv) => {
        const cvSkills = cv.data?.skills || [];
        return skills.some((skill) =>
          cvSkills.some((s) => s.name?.toLowerCase().includes(skill.toLowerCase()))
        );
      });
    }

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: filteredCVs,
      pagination: {
        total: count,
        count: filteredCVs.length,
        perPage: limitNum,
        currentPage: pageNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    logger.error('Search CVs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search CVs',
      error: error.message,
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

/**
 * @route   GET /api/cvs/:id/export/pdf
 * @desc    Export CV as PDF
 * @access  Private
 */
router.get('/:id/export/pdf', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('Exporting CV as PDF:', { userId: req.user?.id, cvId: id });

    // Find CV
    const cv = await CV.findOne({
      where: { id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    // Prepare PDF filename
    const sanitizedTitle = cv.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const pdfFilename = `${sanitizedTitle}-${Date.now()}.pdf`;
    const pdfPath = path.join(__dirname, `../uploads/${req.user.id}`, pdfFilename);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.dirname(pdfPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate PDF
    await generateCVPDF(cv.data || cv, pdfPath);

    // Send file
    res.download(pdfPath, pdfFilename, (err) => {
      if (err) {
        logger.error('PDF download error:', err);
      }

      // Delete temp file after download
      setTimeout(() => {
        try {
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            logger.info('Temporary PDF deleted:', pdfPath);
          }
        } catch (error) {
          logger.error('Temp PDF cleanup error:', error);
        }
      }, 60000); // Delete after 1 minute
    });
  } catch (error) {
    logger.error('PDF export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CV as PDF',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/cvs/:id/export/docx
 * @desc    Export CV as DOCX
 * @access  Private
 */
router.get('/:id/export/docx', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('Exporting CV as DOCX:', { userId: req.user?.id, cvId: id });

    const cv = await CV.findOne({
      where: { id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    const sanitizedTitle = cv.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const docxFilename = `${sanitizedTitle}-${Date.now()}.docx`;
    const docxPath = path.join(__dirname, `../uploads/${req.user.id}`, docxFilename);

    const uploadsDir = path.dirname(docxPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await generateCVDOCX(cv.data || cv, docxPath);

    res.download(docxPath, docxFilename, (err) => {
      if (err) {
        logger.error('DOCX download error:', err);
      }

      setTimeout(() => {
        try {
          if (fs.existsSync(docxPath)) {
            fs.unlinkSync(docxPath);
            logger.info('Temporary DOCX deleted:', docxPath);
          }
        } catch (error) {
          logger.error('Temp DOCX cleanup error:', error);
        }
      }, 60000);
    });
  } catch (error) {
    logger.error('DOCX export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CV as DOCX',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/cvs/:id/export/csv
 * @desc    Export CV as CSV
 * @access  Private
 */
router.get('/:id/export/csv', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('Exporting CV as CSV:', { userId: req.user?.id, cvId: id });

    const cv = await CV.findOne({
      where: { id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    const sanitizedTitle = cv.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const csvFilename = `${sanitizedTitle}-${Date.now()}.csv`;
    const csvPath = path.join(__dirname, `../uploads/${req.user.id}`, csvFilename);

    const uploadsDir = path.dirname(csvPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await generateCVCSV(cv.data || cv, csvPath);

    res.download(csvPath, csvFilename, (err) => {
      if (err) {
        logger.error('CSV download error:', err);
      }

      setTimeout(() => {
        try {
          if (fs.existsSync(csvPath)) {
            fs.unlinkSync(csvPath);
            logger.info('Temporary CSV deleted:', csvPath);
          }
        } catch (error) {
          logger.error('Temp CSV cleanup error:', error);
        }
      }, 60000);
    });
  } catch (error) {
    logger.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CV as CSV',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/cvs/:id/export/json
 * @desc    Export CV as JSON
 * @access  Private
 */
router.get('/:id/export/json', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('Exporting CV as JSON:', { userId: req.user?.id, cvId: id });

    const cv = await CV.findOne({
      where: { id, userId: req.user.id },
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
      });
    }

    const sanitizedTitle = cv.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const jsonFilename = `${sanitizedTitle}-${Date.now()}.json`;
    const jsonPath = path.join(__dirname, `../uploads/${req.user.id}`, jsonFilename);

    const uploadsDir = path.dirname(jsonPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await generateCVJSON(cv.data || cv, jsonPath);

    res.download(jsonPath, jsonFilename, (err) => {
      if (err) {
        logger.error('JSON download error:', err);
      }

      setTimeout(() => {
        try {
          if (fs.existsSync(jsonPath)) {
            fs.unlinkSync(jsonPath);
            logger.info('Temporary JSON deleted:', jsonPath);
          }
        } catch (error) {
          logger.error('Temp JSON cleanup error:', error);
        }
      }, 60000);
    });
  } catch (error) {
    logger.error('JSON export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CV as JSON',
      error: error.message,
    });
  }
});

module.exports = router;
