/**
 * Analytics and performance monitoring for KARTEJI v2.5
 * Lightweight client-side analytics with privacy-first approach
 */

class Analytics {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
    this.pageViews = new Map();
    this.performance = {
      navigationStart: 0,
      loadComplete: 0,
      initialRender: 0
    };
  }

  /**
   * Initialize analytics
   */
  init() {
    // Capture performance metrics
    if (window.performance && window.performance.timing) {
      this.performance.navigationStart = window.performance.timing.navigationStart;
      
      window.addEventListener('load', () => {
        this.performance.loadComplete = Date.now() - this.performance.navigationStart;
        this.trackEvent('performance', 'page_load', this.performance.loadComplete);
      });
    }

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('engagement', 'page_hide');
      } else {
        this.trackEvent('engagement', 'page_show');
      }
    });

    // Track errors
    window.addEventListener('error', (e) => {
      this.trackError('js_error', e.message, e.filename, e.lineno);
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.trackError('promise_rejection', e.reason);
    });
  }

  /**
   * Track a custom event
   * @param {string} category - Event category
   * @param {string} action - Event action
   * @param {any} value - Event value (optional)
   */
  trackEvent(category, action, value = null) {
    const event = {
      timestamp: Date.now(),
      category,
      action,
      value,
      page: location.hash || '#/home'
    };
    
    this.events.push(event);
    
    // Keep only last 100 events to prevent memory issues
    if (this.events.length > 100) {
      this.events.shift();
    }

    // Console log in development
    if (this.isDevelopment()) {
      console.log('[Analytics]', event);
    }
  }

  /**
   * Track page view
   * @param {string} page - Page identifier
   */
  trackPageView(page) {
    const count = (this.pageViews.get(page) || 0) + 1;
    this.pageViews.set(page, count);
    
    this.trackEvent('navigation', 'page_view', page);
  }

  /**
   * Track error
   * @param {string} type - Error type
   * @param {string} message - Error message
   * @param {string} source - Error source (optional)
   * @param {number} line - Line number (optional)
   */
  trackError(type, message, source = '', line = 0) {
    this.trackEvent('error', type, {
      message: String(message).substring(0, 200),
      source,
      line
    });
  }

  /**
   * Track performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value in milliseconds
   */
  trackPerformance(metric, value) {
    this.trackEvent('performance', metric, Math.round(value));
  }

  /**
   * Get session duration in seconds
   * @returns {number} Session duration
   */
  getSessionDuration() {
    return Math.floor((Date.now() - this.sessionStart) / 1000);
  }

  /**
   * Get analytics summary
   * @returns {object} Analytics summary
   */
  getSummary() {
    const eventsByCategory = {};
    this.events.forEach(e => {
      if (!eventsByCategory[e.category]) {
        eventsByCategory[e.category] = [];
      }
      eventsByCategory[e.category].push(e);
    });

    return {
      sessionDuration: this.getSessionDuration(),
      totalEvents: this.events.length,
      eventsByCategory,
      pageViews: Object.fromEntries(this.pageViews),
      performance: this.performance
    };
  }

  /**
   * Check if in development mode
   * @returns {boolean} True if development
   */
  isDevelopment() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }

  /**
   * Export analytics data (for debugging or export feature)
   * @returns {string} JSON string of analytics data
   */
  exportData() {
    return JSON.stringify(this.getSummary(), null, 2);
  }

  /**
   * Clear analytics data
   */
  clear() {
    this.events = [];
    this.pageViews.clear();
    console.log('[Analytics] Data cleared');
  }
}

// Create singleton instance
export const analytics = new Analytics();

/**
 * Measure function execution time
 * @param {Function} fn - Function to measure
 * @param {string} label - Label for the measurement
 * @returns {Function} Wrapped function
 */
export function measurePerformance(fn, label) {
  return async function(...args) {
    const start = performance.now();
    try {
      const result = await fn.apply(this, args);
      const duration = performance.now() - start;
      analytics.trackPerformance(label, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      analytics.trackPerformance(`${label}_error`, duration);
      throw error;
    }
  };
}
