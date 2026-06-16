/**
 * Heatmap and Behavior Analytics Tracking
 * Tracks user interactions for heatmap generation
 */

class HeatmapTracking {
  constructor() {
    this.events = [];
    this.isEnabled = false;
    this.maxEvents = 1000;
  }

  /**
   * Initialize heatmap tracking
   */
  initialize(enabled = false) {
    if (!enabled || typeof window === 'undefined') return;

    this.isEnabled = true;

    // Track mouse movements
    document.addEventListener('mousemove', this.trackMouseMove.bind(this));

    // Track clicks
    document.addEventListener('click', this.trackClick.bind(this));

    // Track scrolls
    window.addEventListener('scroll', this.trackScroll.bind(this));

    // Track form interactions
    document.addEventListener('input', this.trackFormInput.bind(this));
    document.addEventListener('focus', this.trackFormFocus.bind(this), true);
  }

  /**
   * Track mouse movement
   */
  trackMouseMove(event) {
    if (!this.isEnabled) return;

    const { clientX, clientY } = event;
    this.addEvent('mousemove', {
      x: clientX,
      y: clientY,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track click event
   */
  trackClick(event) {
    if (!this.isEnabled) return;

    const target = event.target;
    this.addEvent('click', {
      x: event.clientX,
      y: event.clientY,
      elementTag: target.tagName,
      elementId: target.id,
      elementClass: target.className,
      elementText: target.textContent?.substring(0, 50),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track scroll event
   */
  trackScroll(event) {
    if (!this.isEnabled) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    this.addEvent('scroll', {
      scrollTop,
      scrollLeft,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track form input
   */
  trackFormInput(event) {
    if (!this.isEnabled) return;

    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      this.addEvent('form_input', {
        elementTag: target.tagName,
        elementName: target.name,
        elementId: target.id,
        elementType: target.type,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Track form focus
   */
  trackFormFocus(event) {
    if (!this.isEnabled) return;

    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      this.addEvent('form_focus', {
        elementTag: target.tagName,
        elementName: target.name,
        elementId: target.id,
        elementType: target.type,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Add event to tracking
   */
  addEvent(eventType, eventData) {
    this.events.push({
      type: eventType,
      data: eventData,
    });

    // Trim events if too many
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Get heatmap data
   */
  getHeatmapData() {
    return {
      clicks: this.events.filter((e) => e.type === 'click').map((e) => ({
        x: e.data.x,
        y: e.data.y,
        intensity: 1,
      })),
      scrolls: this.events
        .filter((e) => e.type === 'scroll')
        .map((e) => ({
          scrollTop: e.data.scrollTop,
          scrollLeft: e.data.scrollLeft,
        })),
      formInteractions: this.events.filter(
        (e) => e.type === 'form_input' || e.type === 'form_focus'
      ),
    };
  }

  /**
   * Get behavior data
   */
  getBehaviorData() {
    const behavior = {
      totalEvents: this.events.length,
      eventTypes: {},
      formInteractions: [],
      scrollDepth: 0,
    };

    this.events.forEach((event) => {
      if (!behavior.eventTypes[event.type]) {
        behavior.eventTypes[event.type] = 0;
      }
      behavior.eventTypes[event.type]++;

      if (event.type === 'form_input' || event.type === 'form_focus') {
        behavior.formInteractions.push(event.data);
      }

      if (event.type === 'scroll') {
        behavior.scrollDepth = Math.max(behavior.scrollDepth, event.data.scrollTop);
      }
    });

    return behavior;
  }

  /**
   * Reset tracking
   */
  reset() {
    this.events = [];
  }

  /**
   * Disable tracking
   */
  disable() {
    this.isEnabled = false;
  }

  /**
   * Send tracking data to server
   */
  async sendTrackingData(endpoint = '/api/analytics/tracking') {
    if (this.events.length === 0) return;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heatmapData: this.getHeatmapData(),
          behaviorData: this.getBehaviorData(),
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        this.reset();
      }
    } catch (error) {
      console.error('Failed to send tracking data:', error);
    }
  }
}

const heatmapTracking = new HeatmapTracking();

// Support both CommonJS and ES6 exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = heatmapTracking;
}
