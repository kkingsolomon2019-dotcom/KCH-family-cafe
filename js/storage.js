/**
 * @fileoverview Centralized localStorage wrapper with error handling and fallback for private browsing
 */

/**
 * Storage manager with error handling for localStorage quota exceeded and private browsing mode
 * @class StorageManager
 */
class StorageManager {
  /**
   * Creates a StorageManager instance
   * @constructor
   */
  constructor() {
    this.isAvailable = this._checkStorageAvailability();
    this.cache = {};
    if (!this.isAvailable) {
      console.warn('⚠️ localStorage not available - using in-memory fallback');
    }
  }

  /**
   * Check if localStorage is available and writable
   * @private
   * @returns {boolean} True if localStorage is available
   */
  _checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Safely get data from storage
   * @param {string} key - The storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Parsed value or default
   */
  get(key, defaultValue = null) {
    try {
      if (this.isAvailable) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } else {
        return this.cache[key] !== undefined ? this.cache[key] : defaultValue;
      }
    } catch (error) {
      console.error(`❌ Error reading from storage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Safely set data in storage
   * @param {string} key - The storage key
   * @param {*} value - Value to store (will be JSON stringified)
   * @returns {boolean} True if successful, false otherwise
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (this.isAvailable) {
        localStorage.setItem(key, serialized);
      } else {
        this.cache[key] = value;
      }
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('❌ localStorage quota exceeded');
        alert(ERROR_MESSAGES.storageQuotaExceeded);
      } else {
        console.error(`❌ Error writing to storage (${key}):`, error);
      }
      return false;
    }
  }

  /**
   * Safely remove data from storage
   * @param {string} key - The storage key
   * @returns {boolean} True if successful
   */
  remove(key) {
    try {
      if (this.isAvailable) {
        localStorage.removeItem(key);
      } else {
        delete this.cache[key];
      }
      return true;
    } catch (error) {
      console.error(`❌ Error removing from storage (${key}):`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   * @returns {boolean} True if successful
   */
  clear() {
    try {
      if (this.isAvailable) {
        localStorage.clear();
      } else {
        this.cache = {};
      }
      return true;
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      return false;
    }
  }
}

// ============================================================================
// INITIALIZE STORAGE MANAGER
// ============================================================================

const storage = new StorageManager();

/**
 * Data access layer for application state
 * @class DataStore
 */
class DataStore {
  /**
   * Get all product categories
   * @returns {Array<string>} List of category names
   */
  static getCategories() {
    return storage.get(STORAGE_KEYS.categories, DEFAULTS.categories);
  }

  /**
   * Save categories
   * @param {Array<string>} categories - Category names
   * @returns {boolean} Success status
   */
  static setCategories(categories) {
    return storage.set(STORAGE_KEYS.categories, categories);
  }

  /**
   * Get all menu items
   * @returns {Array<Object>} List of products
   */
  static getMenuItems() {
    return storage.get(STORAGE_KEYS.menuItems, DEFAULTS.menuItems);
  }

  /**
   * Save menu items
   * @param {Array<Object>} items - Product items
   * @returns {boolean} Success status
   */
  static setMenuItems(items) {
    return storage.set(STORAGE_KEYS.menuItems, items);
  }

  /**
   * Get sales history
   * @returns {Array<Object>} List of completed transactions
   */
  static getSalesHistory() {
    return storage.get(STORAGE_KEYS.salesHistory, []);
  }

  /**
   * Save sales history
   * @param {Array<Object>} history - Transaction records
   * @returns {boolean} Success status
   */
  static setSalesHistory(history) {
    return storage.set(STORAGE_KEYS.salesHistory, history);
  }

  /**
   * Get application configuration
   * @returns {Object} Configuration object
   */
  static getConfig() {
    return storage.get(STORAGE_KEYS.config, DEFAULTS.config);
  }

  /**
   * Save configuration
   * @param {Object} config - Configuration object
   * @returns {boolean} Success status
   */
  static setConfig(config) {
    return storage.set(STORAGE_KEYS.config, config);
  }

  /**
   * Clear all application data
   * @returns {boolean} Success status
   */
  static clearAll() {
    return storage.clear();
  }
}