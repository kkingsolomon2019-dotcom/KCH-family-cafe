/**
 * @fileoverview XSS prevention utilities for sanitizing user input
 */

/**
 * Sanitizer utility for preventing XSS attacks
 * @class Sanitizer
 */
class Sanitizer {
  /**
   * Escape HTML special characters
   * @static
   * @param {string} text - Raw text to escape
   * @returns {string} HTML-escaped text safe for innerHTML
   */
  static escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return String(text).replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Sanitize product name - remove or escape dangerous characters
   * @static
   * @param {string} name - Product name to sanitize
   * @returns {string} Sanitized product name
   */
  static sanitizeProductName(name) {
    if (!name || typeof name !== 'string') return '';
    return Sanitizer.escapeHtml(name.trim()).substring(0, VALIDATION.productNameMaxLength);
  }

  /**
   * Sanitize category name
   * @static
   * @param {string} name - Category name to sanitize
   * @returns {string} Sanitized category name
   */
  static sanitizeCategoryName(name) {
    if (!name || typeof name !== 'string') return '';
    return Sanitizer.escapeHtml(name.trim()).substring(0, VALIDATION.categoryNameMaxLength);
  }

  /**
   * Create safe text node instead of using innerHTML
   * @static
   * @param {string} text - Text content
   * @returns {string} Safe HTML text
   */
  static safeText(text) {
    return Sanitizer.escapeHtml(text);
  }

  /**
   * Validate if string contains only safe characters for display
   * @static
   * @param {string} text - Text to validate
   * @returns {boolean} True if text is safe
   */
  static isSafeText(text) {
    if (typeof text !== 'string') return false;
    // Block script tags and event handlers
    const dangerousPatterns = /<script|<iframe|javascript:|on\w+\s*=/gi;
    return !dangerousPatterns.test(text);
  }
}