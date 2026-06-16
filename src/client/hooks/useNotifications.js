import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for managing notifications
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async (limit = 20, unreadOnly = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit,
        unreadOnly,
      });

      const response = await fetch(`/api/notifications?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get notification statistics
   */
  const getStats = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data?.unreadCount || 0);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return true;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        return true;
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
        return true;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    fetchNotifications();
    getStats();

    // Set up polling (optional)
    const interval = setInterval(() => {
      getStats();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications, getStats]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    getStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

/**
 * Hook for managing notification preferences
 */
export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch preferences
   */
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update preferences
   */
  const updatePreferences = async (updates) => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle a preference
   */
  const togglePreference = async (key) => {
    if (!preferences) return;

    const updated = await updatePreferences({
      [key]: !preferences[key],
    });

    return updated;
  };

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    fetchPreferences,
    updatePreferences,
    togglePreference,
  };
};
