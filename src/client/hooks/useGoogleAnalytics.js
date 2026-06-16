/**
 * Google Analytics Hook
 * Initialize and use Google Analytics in React components
 */

import { useEffect } from 'react';
import analyticsClient from '../utils/analyticsClient';

/**
 * useGoogleAnalytics Hook
 * Initialize Google Analytics on page load
 */
export const useGoogleAnalytics = (gaId) => {
  useEffect(() => {
    if (gaId) {
      analyticsClient.initialize(gaId);
    }
  }, [gaId]);

  return analyticsClient;
};

/**
 * usePageView Hook
 * Track page views
 */
export const usePageView = (path, title) => {
  useEffect(() => {
    if (path) {
      analyticsClient.pageView(path, title);
    }
  }, [path, title]);
};

/**
 * useTracking Hook
 * Generic tracking hook
 */
export const useTracking = () => {
  return analyticsClient;
};
