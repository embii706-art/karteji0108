/**
 * Security utilities for KARTEJI v3.0
 * Provides input validation, sanitization, and XSS protection
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - Raw HTML string
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Escape HTML entities
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  return String(str).replace(/[&<>"'/]/g, m => map[m]);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).toLowerCase());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, message: string }
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Kata sandi minimal 6 karakter' };
  }
  if (password.length < 8) {
    return { valid: true, message: 'Kata sandi cukup kuat' };
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (strength >= 3) {
    return { valid: true, message: 'Kata sandi sangat kuat' };
  } else if (strength >= 2) {
    return { valid: true, message: 'Kata sandi kuat' };
  }
  
  return { valid: true, message: 'Kata sandi dapat ditingkatkan' };
}

/**
 * Sanitize file name
 * @param {string} filename - File name to sanitize
 * @returns {string} Sanitized file name
 */
export function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
}

/**
 * Check if URL is safe (no javascript:, data:, etc.)
 * @param {string} url - URL to check
 * @returns {boolean} True if safe
 */
export function isSafeUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  return !dangerousProtocols.some(protocol => lower.startsWith(protocol));
}

/**
 * Rate limiter (client-side)
 * @param {string} key - Unique key for the action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if action is allowed
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const storageKey = `ratelimit_${key}`;
  
  let attempts = [];
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      attempts = JSON.parse(stored).filter(time => now - time < windowMs);
    }
  } catch (e) {
    console.warn('Rate limit storage error:', e);
  }
  
  if (attempts.length >= maxAttempts) {
    return false;
  }
  
  attempts.push(now);
  try {
    localStorage.setItem(storageKey, JSON.stringify(attempts));
  } catch (e) {
    console.warn('Rate limit storage error:', e);
  }
  
  return true;
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 1000) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
