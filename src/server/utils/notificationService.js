/**
 * Notification Service
 * Handles in-app notifications, email notifications, and preferences
 */

const logger = require('./logger');

/**
 * In-app Notifications Storage
 */
class NotificationService {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 10000;
  }

  /**
   * Create notification
   */
  createNotification(userId, type, title, message, metadata = {}) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type, // 'email', 'cv_created', 'cv_updated', 'password_reset', etc.
      title,
      message,
      metadata,
      read: false,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
    };

    this.notifications.push(notification);

    // Trim notifications if exceeds max
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(-this.maxNotifications);
    }

    logger.info('Notification created', {
      notificationId: notification.id,
      userId,
      type,
    });

    return notification;
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId, limit = 20, unreadOnly = false) {
    let userNotifications = this.notifications.filter((n) => n.userId === userId);

    if (unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.read);
    }

    return userNotifications.slice(-limit).reverse();
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId, userId) {
    const notification = this.notifications.find(
      (n) => n.id === notificationId && n.userId === userId
    );

    if (notification) {
      notification.read = true;
      logger.info('Notification marked as read', { notificationId, userId });
      return notification;
    }

    return null;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId) {
    const userNotifications = this.notifications.filter((n) => n.userId === userId);
    userNotifications.forEach((n) => {
      n.read = true;
    });

    logger.info('All notifications marked as read', { userId });
    return userNotifications;
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId, userId) {
    const index = this.notifications.findIndex(
      (n) => n.id === notificationId && n.userId === userId
    );

    if (index !== -1) {
      this.notifications.splice(index, 1);
      logger.info('Notification deleted', { notificationId, userId });
      return true;
    }

    return false;
  }

  /**
   * Get notification statistics
   */
  getNotificationStats(userId) {
    const userNotifications = this.notifications.filter((n) => n.userId === userId);
    const unreadCount = userNotifications.filter((n) => !n.read).length;

    return {
      totalNotifications: userNotifications.length,
      unreadCount,
      notifications: userNotifications.slice(-10),
    };
  }

  /**
   * Get all notifications (for admin)
   */
  getAllNotifications(limit = 100) {
    return this.notifications.slice(-limit).reverse();
  }

  /**
   * Clear old notifications
   */
  clearOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter((n) => n.createdAt > cutoffDate);

    const deletedCount = initialCount - this.notifications.length;
    logger.info('Old notifications cleared', { deletedCount, daysOld });

    return deletedCount;
  }
}

/**
 * Notification Preferences
 */
class NotificationPreferences {
  constructor() {
    this.preferences = new Map();
    this.defaultPreferences = {
      emailNotifications: true,
      cvCreatedEmail: true,
      cvUpdatedEmail: true,
      passwordResetEmail: true,
      securityAlerts: true,
      weeklyDigest: true,
      marketingEmails: false,
      unsubscribeAll: false,
    };
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId) {
    if (!this.preferences.has(userId)) {
      this.preferences.set(userId, { ...this.defaultPreferences });
    }

    return this.preferences.get(userId);
  }

  /**
   * Update preferences
   */
  updatePreferences(userId, updates) {
    const current = this.getUserPreferences(userId);
    const updated = { ...current, ...updates };

    this.preferences.set(userId, updated);

    logger.info('Notification preferences updated', {
      userId,
      changes: updates,
    });

    return updated;
  }

  /**
   * Check if notification type is enabled
   */
  isNotificationEnabled(userId, notificationType) {
    const prefs = this.getUserPreferences(userId);

    if (prefs.unsubscribeAll) {
      return false;
    }

    return prefs[notificationType] !== false;
  }

  /**
   * Get all preferences (admin)
   */
  getAllPreferences() {
    const result = {};
    this.preferences.forEach((prefs, userId) => {
      result[userId] = prefs;
    });
    return result;
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(userId) {
    this.preferences.set(userId, { ...this.defaultPreferences });
    logger.info('Notification preferences reset to defaults', { userId });
    return this.preferences.get(userId);
  }
}

module.exports = {
  notificationService: new NotificationService(),
  notificationPreferences: new NotificationPreferences(),
};
