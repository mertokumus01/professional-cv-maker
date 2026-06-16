import React, { useState } from 'react';
import { useNotifications, useNotificationPreferences } from '../hooks/useNotifications';
import styles from '../styles/notifications.module.css';

/**
 * Notification Bell Component
 * Displays notification count and dropdown
 */
export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notificationId, isRead) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  return (
    <div className={styles.notificationBell}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notifications</h3>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className={styles.empty}>No notifications</div>
          ) : (
            <div className={styles.notificationsList}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.read ? styles.unread : ''
                  }`}
                  onClick={() =>
                    handleNotificationClick(notification.id, notification.read)
                  }
                >
                  <div className={styles.notificationContent}>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className={styles.time}>
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) =>
                      handleDelete(e, notification.id)
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.footer}>
            <a href="/notifications">View All</a>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Notification Center Page
 */
export const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const {
    preferences,
    loading: prefsLoading,
    updatePreferences,
    togglePreference,
  } = useNotificationPreferences();

  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div className={styles.notificationCenter}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.centerHeader}>
          <h1>Notification Center</h1>
          <p>Manage your notifications and preferences</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === 'notifications' ? styles.active : ''
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications ({unreadCount})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === 'preferences' ? styles.active : ''
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className={styles.tabContent}>
            <div className={styles.notificationHeader}>
              <h2>Your Notifications</h2>
              {unreadCount > 0 && (
                <button
                  className={styles.markAllBtn}
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {loading ? (
              <div className={styles.loading}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <p>You're all caught up! No notifications here.</p>
              </div>
            ) : (
              <div className={styles.notificationsList}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      !notification.read ? styles.unread : ''
                    }`}
                  >
                    <div className={styles.badge}>
                      {!notification.read ? '●' : '○'}
                    </div>
                    <div className={styles.content}>
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <div className={styles.meta}>
                        <span className={styles.time}>
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </span>
                        <span className={styles.type}>{notification.type}</span>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      {!notification.read && (
                        <button
                          className={styles.readBtn}
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className={styles.tabContent}>
            <h2>Notification Preferences</h2>

            {prefsLoading ? (
              <div className={styles.loading}>Loading preferences...</div>
            ) : preferences ? (
              <div className={styles.preferencesList}>
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>Email Notifications</h3>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={() =>
                        togglePreference('emailNotifications')
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>CV Created Email</h3>
                    <p>Get notified when you create a new CV</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.cvCreatedEmail}
                      onChange={() =>
                        togglePreference('cvCreatedEmail')
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>CV Updated Email</h3>
                    <p>Get notified when you update a CV</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.cvUpdatedEmail}
                      onChange={() =>
                        togglePreference('cvUpdatedEmail')
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>Password Reset Email</h3>
                    <p>Get notified when password reset is requested</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.passwordResetEmail}
                      onChange={() =>
                        togglePreference('passwordResetEmail')
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>Security Alerts</h3>
                    <p>Get notified about security-related events</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.securityAlerts}
                      onChange={() =>
                        togglePreference('securityAlerts')
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>Weekly Digest</h3>
                    <p>Receive a weekly summary of your activity</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.weeklyDigest}
                      onChange={() =>
                        togglePreference('weeklyDigest')
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>Marketing Emails</h3>
                    <p>Receive promotional content and updates</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.marketingEmails}
                      onChange={() =>
                        togglePreference('marketingEmails')
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceInfo}>
                    <h3>Unsubscribe All</h3>
                    <p>Disable all email notifications</p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={preferences.unsubscribeAll}
                      onChange={() =>
                        togglePreference('unsubscribeAll')
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            ) : (
              <div className={styles.empty}>
                <p>Unable to load preferences</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
