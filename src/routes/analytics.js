const express = require('express');
const router = express.Router();
const logger = require('../server/utils/logger');
const activityLogger = require('../server/utils/activityLogger');

/**
 * @route   GET /api/analytics/health
 * @desc    Get application health and performance metrics
 * @access  Public
 */
router.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  res.json({
    success: true,
    health: {
      status: 'healthy',
      uptime: Math.floor(uptime),
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * @route   POST /api/analytics/event
 * @desc    Track user event
 * @access  Public
 */
router.post('/event', (req, res) => {
  try {
    const { eventName, eventData, userId } = req.body;

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required',
      });
    }

    logger.info('Analytics event tracked', {
      eventName,
      eventData,
      userId,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Event tracked successfully',
    });
  } catch (error) {
    logger.error('Failed to track event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event',
    });
  }
});

/**
 * @route   POST /api/analytics/tracking
 * @desc    Track user behavior and heatmap data
 * @access  Private
 */
router.post('/tracking', (req, res) => {
  try {
    const { heatmapData, behaviorData } = req.body;
    const userId = req.user?.id;

    if (heatmapData) {
      logger.debug('Heatmap data received', {
        userId,
        clickCount: heatmapData.clicks?.length || 0,
        scrollCount: heatmapData.scrolls?.length || 0,
        formInteractions: heatmapData.formInteractions?.length || 0,
      });
    }

    if (behaviorData) {
      logger.debug('Behavior data received', {
        userId,
        totalEvents: behaviorData.totalEvents,
        eventTypes: behaviorData.eventTypes,
        scrollDepth: behaviorData.scrollDepth,
      });
    }

    res.json({
      success: true,
      message: 'Tracking data recorded',
    });
  } catch (error) {
    logger.error('Failed to record tracking data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record tracking data',
    });
  }
});

/**
 * @route   GET /api/analytics/activities
 * @desc    Get user activities
 * @access  Private (Admin)
 */
router.get('/activities', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const activities = activityLogger.getRecentActivities(limit);

    res.json({
      success: true,
      data: activities,
      total: activities.length,
    });
  } catch (error) {
    logger.error('Failed to fetch activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
    });
  }
});

/**
 * @route   GET /api/analytics/activities/user/:userId
 * @desc    Get activities for a specific user
 * @access  Private
 */
router.get('/activities/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);

    // Check authorization
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these activities',
      });
    }

    const activities = activityLogger.getUserActivities(userId, limit);

    res.json({
      success: true,
      data: activities,
      total: activities.length,
    });
  } catch (error) {
    logger.error('Failed to fetch user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activities',
    });
  }
});

/**
 * @route   GET /api/analytics/stats
 * @desc    Get activity statistics
 * @access  Private (Admin)
 */
router.get('/stats', (req, res) => {
  try {
    const stats = activityLogger.getActivityStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to fetch activity statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * @route   POST /api/analytics/user-activity
 * @desc    Log user activity from frontend
 * @access  Public
 */
router.post('/user-activity', (req, res) => {
  try {
    const { userId, action, details } = req.body;

    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        message: 'userId and action are required',
      });
    }

    activityLogger.logActivity(userId, action, details || {});

    res.json({
      success: true,
      message: 'Activity logged successfully',
    });
  } catch (error) {
    logger.error('Failed to log user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity',
    });
  }
});

module.exports = router;
