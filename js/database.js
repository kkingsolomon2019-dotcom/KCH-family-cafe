/**
 * @fileoverview Dexie.js (IndexedDB) database wrapper for unlimited offline storage
 * Replaces localStorage limitations with persistent, queryable database
 */

/**
 * Initialize Dexie database for Family Cafe POS
 * @class FamilyCafeDB
 * @extends Dexie
 */
class FamilyCafeDB extends Dexie {
  /**
   * Creates FamilyCafeDB instance and defines schema
   * @constructor
   */
  constructor() {
    super('FamilyCafeDB');
    
    // Define database schema with tables
    this.version(1).stores({
      salesHistory: '++id, timestamp, transactionId',
      menuItems: '++id, name, category',
      categories: '++id, name',
      config: 'key',
      auditLog: '++id, timestamp, action',
    });
  }
}

/**
 * Global database instance
 * @type {FamilyCafeDB}
 */
const db = new FamilyCafeDB();

/**
 * Database operations wrapper with error handling
 * @class DatabaseManager
 */
class DatabaseManager {
  /**
   * Initialize database with default data if empty
   * @static
   * @async
   * @returns {Promise<boolean>} Success status
   */
  static async initialize() {
    try {
      console.log('🗄️ Initializing FamilyCafeDB...');
      
      // Check if database is empty
      const configCount = await db.config.count();
      
      if (configCount === 0) {
        console.log('📝 Database empty - loading defaults...');
        await DatabaseManager.loadDefaults();
      }
      
      console.log('✅ Database initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }

  /**
   * Load default data into database
   * @static
   * @async
   * @private
   * @returns {Promise<void>}
   */
  static async loadDefaults() {
    try {
      // Load default categories
      await db.categories.bulkAdd(
        DEFAULTS.categories.map((name, idx) => ({ id: idx + 1, name }))
      );

      // Load default menu items
      await db.menuItems.bulkAdd(DEFAULTS.menuItems);

      // Load default config
      const configEntries = Object.entries(DEFAULTS.config).map(([key, value]) => ({
        key,
        value,
        updatedAt: new Date(),
      }));
      await db.config.bulkAdd(configEntries);

      console.log('📚 Default data loaded');
    } catch (error) {
      console.error('❌ Error loading defaults:', error);
    }
  }

  /**
   * Save a sales transaction to database
   * @static
   * @async
   * @param {Object} saleData - Transaction data
   * @param {Array<Object>} saleData.items - Cart items sold
   * @param {number} saleData.subtotal - Pre-tax subtotal
   * @param {number} saleData.taxAndService - Tax + service charges
   * @param {number} saleData.total - Final total due
   * @param {string} [saleData.paymentMethod] - Payment method used
   * @returns {Promise<number>} Database ID of saved sale
   */
  static async saveSale(saleData) {
    try {
      const transactionId = `TX-${Math.floor(TRANSACTION.idMinRange + Math.random() * (TRANSACTION.idMaxRange - TRANSACTION.idMinRange))}`;
      const now = new Date();
      
      const sale = {
        transactionId,
        timestamp: now.toISOString(),
        timestampDisplay: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(),
        items: saleData.items,
        subtotal: saleData.subtotal,
        tax: saleData.tax || 0,
        service: saleData.service || 0,
        taxAndService: saleData.taxAndService,
        total: saleData.total,
        paymentMethod: saleData.paymentMethod || 'cash',
        notes: saleData.notes || '',
        syncedToBackend: false,
      };

      const saleId = await db.salesHistory.add(sale);
      console.log(`✅ Sale saved (ID: ${saleId}, TX: ${transactionId})`);
      
      // Log audit trail
      await DatabaseManager.logAudit('SALE_CREATED', `Sale ${transactionId} recorded for ${sale.total}`);
      
      return saleId;
    } catch (error) {
      console.error('❌ Error saving sale:', error);
      throw error;
    }
  }

  /**
   * Get all sales from database with optional filtering
   * @static
   * @async
   * @param {Object} [options] - Query options
   * @param {number} [options.limit] - Limit results
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.startDate] - ISO date string filter
   * @param {string} [options.endDate] - ISO date string filter
   * @returns {Promise<Array<Object>>} Array of sales
   */
  static async getSales(options = {}) {
    try {
      let query = db.salesHistory.orderBy('timestamp').reverse();

      // Apply date range filter if provided
      if (options.startDate || options.endDate) {
        const start = options.startDate || '1970-01-01';
        const end = options.endDate || '2099-12-31';
        query = query.filter(sale => sale.timestamp >= start && sale.timestamp <= end);
      }

      // Apply limit and offset
      if (options.offset) query = query.offset(options.offset);
      if (options.limit) query = query.limit(options.limit);

      const sales = await query.toArray();
      console.log(`📊 Retrieved ${sales.length} sales`);
      return sales;
    } catch (error) {
      console.error('❌ Error fetching sales:', error);
      return [];
    }
  }

  /**
   * Get single sale by transaction ID
   * @static
   * @async
   * @param {string} transactionId - Transaction ID to find
   * @returns {Promise<Object|null>} Sale object or null
   */
  static async getSaleByTransactionId(transactionId) {
    try {
      const sale = await db.salesHistory.where('transactionId').equals(transactionId).first();
      return sale || null;
    } catch (error) {
      console.error('❌ Error fetching sale:', error);
      return null;
    }
  }

  /**
   * Get sales statistics
   * @static
   * @async
   * @returns {Promise<Object>} Statistics object
   */
  static async getSalesStats() {
    try {
      const sales = await db.salesHistory.toArray();
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalTaxAndService = sales.reduce((sum, sale) => sum + sale.taxAndService, 0);
      const itemsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((qty, item) => qty + item.qty, 0), 0);

      return {
        totalTransactions: sales.length,
        totalRevenue,
        totalTaxAndService,
        itemsSold,
        averageTransaction: sales.length > 0 ? totalRevenue / sales.length : 0,
      };
    } catch (error) {
      console.error('❌ Error calculating statistics:', error);
      return { totalTransactions: 0, totalRevenue: 0, totalTaxAndService: 0, itemsSold: 0 };
    }
  }

  /**
   * Update menu item stock
   * @static
   * @async
   * @param {number} itemId - Menu item ID
   * @param {number} newStock - New stock level
   * @returns {Promise<boolean>} Success status
   */
  static async updateStock(itemId, newStock) {
    try {
      const item = await db.menuItems.get(itemId);
      if (!item) {
        console.error(`❌ Item ${itemId} not found`);
        return false;
      }

      await db.menuItems.update(itemId, {
        initialStock: Math.max(0, newStock),
      });

      console.log(`📦 Stock updated for item ${itemId}: ${newStock}`);
      await DatabaseManager.logAudit('STOCK_UPDATED', `Item ${itemId} stock set to ${newStock}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      return false;
    }
  }

  /**
   * Increment sold count for multiple items (after checkout)
   * @static
   * @async
   * @param {Array<Object>} cartItems - Items with qty to deduct
   * @returns {Promise<boolean>} Success status
   */
  static async deductStock(cartItems) {
    try {
      await db.transaction('rw', db.menuItems, async () => {
        for (const item of cartItems) {
          const menuItem = await db.menuItems.get(item.id);
          if (menuItem) {
            await db.menuItems.update(item.id, {
              soldCount: (menuItem.soldCount || 0) + item.qty,
            });
          }
        }
      });

      console.log(`✅ Stock deducted for ${cartItems.length} items`);
      await DatabaseManager.logAudit('STOCK_DEDUCTED', `Deducted stock for ${cartItems.length} items`);
      return true;
    } catch (error) {
      console.error('❌ Error deducting stock:', error);
      return false;
    }
  }

  /**
   * Get all menu items
   * @static
   * @async
   * @returns {Promise<Array<Object>>} All menu items
   */
  static async getMenuItems() {
    try {
      return await db.menuItems.toArray();
    } catch (error) {
      console.error('❌ Error fetching menu items:', error);
      return [];
    }
  }

  /**
   * Add new menu item
   * @static
   * @async
   * @param {Object} itemData - Item to create
   * @returns {Promise<number>} New item ID
   */
  static async addMenuItem(itemData) {
    try {
      const itemId = await db.menuItems.add({
        ...itemData,
        soldCount: 0,
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ Menu item added (ID: ${itemId})`);
      await DatabaseManager.logAudit('ITEM_CREATED', `New item: ${itemData.name}`);
      return itemId;
    } catch (error) {
      console.error('❌ Error adding menu item:', error);
      throw error;
    }
  }

  /**
   * Delete menu item
   * @static
   * @async
   * @param {number} itemId - Item ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteMenuItem(itemId) {
    try {
      const item = await db.menuItems.get(itemId);
      if (!item) {
        console.error(`❌ Item ${itemId} not found`);
        return false;
      }

      await db.menuItems.delete(itemId);
      console.log(`✅ Menu item deleted (ID: ${itemId})`);
      await DatabaseManager.logAudit('ITEM_DELETED', `Deleted: ${item.name}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      return false;
    }
  }

  /**
   * Get all categories
   * @static
   * @async
   * @returns {Promise<Array<string>>} Category names
   */
  static async getCategories() {
    try {
      const categories = await db.categories.toArray();
      return categories.map(c => c.name);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return DEFAULTS.categories;
    }
  }

  /**
   * Add new category
   * @static
   * @async
   * @param {string} categoryName - Category to add
   * @returns {Promise<number>} New category ID
   */
  static async addCategory(categoryName) {
    try {
      const id = await db.categories.add({ name: categoryName });
      console.log(`✅ Category added (ID: ${id})`);
      await DatabaseManager.logAudit('CATEGORY_CREATED', `New category: ${categoryName}`);
      return id;
    } catch (error) {
      console.error('❌ Error adding category:', error);
      throw error;
    }
  }

  /**
   * Load configuration
   * @static
   * @async
   * @returns {Promise<Object>} Config object
   */
  static async loadConfig() {
    try {
      const configArray = await db.config.toArray();
      const config = {};
      configArray.forEach(item => {
        config[item.key] = item.value;
      });

      // Return merged with defaults
      return { ...DEFAULTS.config, ...config };
    } catch (error) {
      console.error('❌ Error loading config:', error);
      return DEFAULTS.config;
    }
  }

  /**
   * Save configuration value
   * @static
   * @async
   * @param {string} key - Config key
   * @param {*} value - Config value
   * @returns {Promise<boolean>} Success status
   */
  static async saveConfig(key, value) {
    try {
      await db.config.put({
        key,
        value,
        updatedAt: new Date(),
      });

      console.log(`✅ Config saved (${key})`);
      return true;
    } catch (error) {
      console.error('❌ Error saving config:', error);
      return false;
    }
  }

  /**
   * Log audit trail entry
   * @static
   * @async
   * @param {string} action - Action type
   * @param {string} description - Action description
   * @returns {Promise<number>} Audit log ID
   */
  static async logAudit(action, description) {
    try {
      return await db.auditLog.add({
        timestamp: new Date().toISOString(),
        action,
        description,
        userId: 'system',
      });
    } catch (error) {
      console.error('❌ Error logging audit:', error);
      return 0;
    }
  }

  /**
   * Get audit log
   * @static
   * @async
   * @param {number} [limit] - Limit results
   * @returns {Promise<Array<Object>>} Audit log entries
   */
  static async getAuditLog(limit = 100) {
    try {
      return await db.auditLog.orderBy('timestamp').reverse().limit(limit).toArray();
    } catch (error) {
      console.error('❌ Error fetching audit log:', error);
      return [];
    }
  }

  /**
   * Export all data for backup
   * @static
   * @async
   * @returns {Promise<Object>} Complete database export
   */
  static async exportData() {
    try {
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        salesHistory: await db.salesHistory.toArray(),
        menuItems: await db.menuItems.toArray(),
        categories: await db.categories.toArray(),
        config: await db.config.toArray(),
        auditLog: await db.auditLog.toArray(),
      };

      console.log('✅ Data exported successfully');
      return backup;
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return null;
    }
  }

  /**
   * Clear all data (factory reset)
   * @static
   * @async
   * @returns {Promise<boolean>} Success status
   */
  static async clearAll() {
    try {
      await db.delete();
      await db.open();
      console.log('✅ Database cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      return false;
    }
  }

  /**
   * Get database storage size estimate
   * @static
   * @async
   * @returns {Promise<Object>} Storage usage info
   */
  static async getStorageInfo() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage,
          quota: estimate.quota,
          percentage: (estimate.usage / estimate.quota) * 100,
          usageMB: (estimate.usage / 1024 / 1024).toFixed(2),
          quotaMB: (estimate.quota / 1024 / 1024).toFixed(2),
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return null;
    }
  }
}
