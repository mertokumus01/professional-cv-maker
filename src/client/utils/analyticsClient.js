/**
 * Google Analytics Client
 * Handles frontend analytics tracking
 */

class AnalyticsClient {
  constructor() {
    this.gaId = null;
    this.isInitialized = false;
    this.events = [];
  }

  /**
   * Initialize Google Analytics
   */
  initialize(gaId) {
    if (!gaId) return;

    this.gaId = gaId;

    // Add Google Analytics script
    if (typeof window !== 'undefined' && !this.isInitialized) {
      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', gaId);

      window.gtag = gtag;
      this.isInitialized = true;
    }
  }

  /**
   * Track page view
   */
  pageView(path, title) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });

    this.trackEvent('page_view', { path, title });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, eventParams = {}) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', eventName, eventParams);

    // Store event locally
    this.events.push({
      timestamp: new Date().toISOString(),
      eventName,
      eventParams,
    });
  }

  /**
   * Track user signup
   */
  trackSignup(method) {
    this.trackEvent('sign_up', {
      method,
    });
  }

  /**
   * Track user login
   */
  trackLogin(method) {
    this.trackEvent('login', {
      method,
    });
  }

  /**
   * Track user logout
   */
  trackLogout() {
    this.trackEvent('logout', {});
  }

  /**
   * Track CV creation
   */
  trackCVCreation(templateType) {
    this.trackEvent('cv_creation', {
      template_type: templateType,
    });
  }

  /**
   * Track CV update
   */
  trackCVUpdate() {
    this.trackEvent('cv_update', {});
  }

  /**
   * Track CV export
   */
  trackCVExport(format) {
    this.trackEvent('cv_export', {
      export_format: format,
    });
  }

  /**
   * Track CV download
   */
  trackCVDownload(format) {
    this.trackEvent('cv_download', {
      download_format: format,
    });
  }

  /**
   * Track search
   */
  trackSearch(query, resultsCount) {
    this.trackEvent('search', {
      search_query: query,
      results_count: resultsCount,
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName, location) {
    this.trackEvent('button_click', {
      button_name: buttonName,
      location,
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName) {
    this.trackEvent('form_submit', {
      form_name: formName,
    });
  }

  /**
   * Track error
   */
  trackError(errorType, errorMessage) {
    this.trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
    });
  }

  /**
   * Track time on page
   */
  trackTimeOnPage(path, timeInSeconds) {
    this.trackEvent('time_on_page', {
      page_path: path,
      time_in_seconds: Math.round(timeInSeconds),
    });
  }

  /**
   * Get stored events
   */
  getStoredEvents() {
    return this.events;
  }

  /**
   * Clear stored events
   */
  clearStoredEvents() {
    this.events = [];
  }
}

const analyticsClient = new AnalyticsClient();

// Support both CommonJS and ES6 exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = analyticsClient;
}
