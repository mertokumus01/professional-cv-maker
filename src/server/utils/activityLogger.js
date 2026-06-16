const logger = require('./logger');

/**
 * User Activity Logger Utility
 * Tracks user actions for analytics and debugging
 */

class ActivityLogger {
  constructor() {
    this.activities = [];
    this.maxActivities = 10000;
  }

  /**
   * Log user activity
   */
  logActivity(userId, action, details = {}) {
    const activity = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      details,
    };

    this.activities.push(activity);

    // Trim activities array if it gets too large
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(-this.maxActivities);
    }

    // Log to Winston as well
    logger.info(`User activity: ${action}`, {
      userId,
      action,
      ...details,
    });
  }

  /**
   * Log login activity
   */
  logLogin(userId, ip, userAgent) {
    this.logActivity(userId, 'LOGIN', {
      ip,
      userAgent,
    });
  }

  /**
   * Log logout activity
   */
  logLogout(userId) {
    this.logActivity(userId, 'LOGOUT', {});
  }

  /**
   * Log CV creation
   */
  logCVCreation(userId, cvId, templateType) {
    this.logActivity(userId, 'CV_CREATED', {
      cvId,
      templateType,
    });
  }

  /**
   * Log CV update
   */
  logCVUpdate(userId, cvId) {
    this.logActivity(userId, 'CV_UPDATED', {
      cvId,
    });
  }

  /**
   * Log CV deletion
   */
  logCVDeletion(userId, cvId) {
    this.logActivity(userId, 'CV_DELETED', {
      cvId,
    });
  }

  /**
   * Log CV export
   */
  logCVExport(userId, cvId, format) {
    this.logActivity(userId, 'CV_EXPORTED', {
      cvId,
      format,
    });
  }

  /**
   * Log CV download
   */
  logCVDownload(userId, cvId, format) {
    this.logActivity(userId, 'CV_DOWNLOADED', {
      cvId,
      format,
    });
  }

  /**
   * Log search action
   */
  logSearch(userId, query, resultsCount) {
    this.logActivity(userId, 'SEARCH', {
      query,
      resultsCount,
    });
  }

  /**
   * Log profile update
   */
  logProfileUpdate(userId) {
    this.logActivity(userId, 'PROFILE_UPDATED', {});
  }

  /**
   * Log password change
   */
  logPasswordChange(userId, ip) {
    this.logActivity(userId, 'PASSWORD_CHANGED', {
      ip,
    });
  }

  /**
   * Log failed login attempt
   */
  logFailedLogin(email, ip) {
    this.logActivity('ANONYMOUS', 'LOGIN_FAILED', {
      email,
      ip,
    });
  }

  /**
   * Get recent activities
   */
  getRecentActivities(limit = 100) {
    return this.activities.slice(-limit).reverse();
  }

  /**
   * Get activities for a user
   */
  getUserActivities(userId, limit = 100) {
    return this.activities
      .filter((activity) => activity.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get activity statistics
   */
  getActivityStats() {
    const stats = {
      totalActivities: this.activities.length,
      activitiesByType: {},
      activitiesByUser: {},
      recentActivities: this.getRecentActivities(10),
    };

    this.activities.forEach((activity) => {
      // Count by type
      if (!stats.activitiesByType[activity.action]) {
        stats.activitiesByType[activity.action] = 0;
      }
      stats.activitiesByType[activity.action]++;

      // Count by user
      if (!stats.activitiesByUser[activity.userId]) {
        stats.activitiesByUser[activity.userId] = 0;
      }
      stats.activitiesByUser[activity.userId]++;
    });

    return stats;
  }

  /**
   * Clear all activities
   */
  clearActivities() {
    this.activities = [];
  }
}

module.exports = new ActivityLogger();
