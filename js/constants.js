/**
 * @fileoverview Application constants including DOM selectors, default values, and configuration
 */

// ============================================================================
// DOM SELECTORS
// ============================================================================

const SELECTORS = {
  // Header elements
  headerShopName: '#headerShopName',
  lockBtnIcon: '#lockBtnIcon',
  lockBtnText: '#lockBtnText',
  managerLockBtn: '#managerLockBtn',

  // Navigation tabs
  tabRegister: '#tab-register',
  tabStock: '#tab-stock',
  tabAnalytics: '#tab-analytics',
  tabCatalog: '#tab-catalog',
  tabSettings: '#tab-settings',

  // Register/POS view
  categorySlider: '#categorySlider',
  productsGrid: '#productsGrid',
  cartEntries: '#cartEntries',
  liveSmsFeed: '#liveSmsFeed',

  // Summary/totals
  summarySubtotal: '#summarySubtotal',
  lblTax: '#lblTax',
  summaryTax: '#summaryTax',
  lblService: '#lblService',
  summaryService: '#summaryService',
  summaryTotal: '#summaryTotal',

  // Stock shelf view
  stockTableBody: '#stockTableBody',

  // Analytics view
  statRevenue: '#statRevenue',
  statCount: '#statCount',
  statTaxPool: '#statTaxPool',
  analyticsLogList: '#analyticsLogList',

  // Catalog view
  txtNewCategory: '#txtNewCategory',
  prodName: '#prodName',
  prodCategory: '#prodCategory',
  prodPrice: '#prodPrice',
  prodStock: '#prodStock',
  catalogManagerList: '#catalogManagerList',

  // Settings view
  cfgShopName: '#cfgShopName',
  cfgCurrency: '#cfgCurrency',
  cfgTax: '#cfgTax',
  cfgService: '#cfgService',
  pinOld: '#pinOld',
  pinNew: '#pinNew',
  devApiId: '#devApiId',
  devApiKey: '#devApiKey',

  // Auth modal
  authModal: '#authModal',
  authPinInput: '#authPinInput',

  // Print modal
  printModal: '#printModal',
  receiptShopName: '#receiptShopName',
  receiptTimestamp: '#receiptTimestamp',
  receiptCustomerItems: '#receiptCustomerItems',
  rcpSubtotal: '#rcpSubtotal',
  rcpTaxLbl: '#rcpTaxLbl',
  rcpTax: '#rcpTax',
  rcpServiceLbl: '#rcpServiceLbl',
  rcpService: '#rcpService',
  rcpTotal: '#rcpTotal',
  kitchenOrderNum: '#kitchenOrderNum',
  kitchenTimestamp: '#kitchenTimestamp',
  receiptKitchenItems: '#receiptKitchenItems',

  // View sections
  viewRegister: '#view-register',
  viewStock: '#view-stock',
  viewAnalytics: '#view-analytics',
  viewCatalog: '#view-catalog',
  viewSettings: '#view-settings',
};

// ============================================================================
// LOCALSTORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  categories: 'pos_categories',
  menuItems: 'pos_menuItems',
  salesHistory: 'pos_salesHistory',
  config: 'pos_config',
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULTS = {
  categories: ['All Items', 'Soft Drinks', 'Fast Food', 'Cultural Food', 'Cakes \& Desserts'],
  menuItems: [
    { id: 1, name: 'Coca-Cola', category: 'Soft Drinks', price: 35.0, initialStock: 100, soldCount: 0 },
    { id: 2, name: 'Special Shiro Wat', category: 'Cultural Food', price: 180.0, initialStock: 40, soldCount: 0 },
    { id: 3, name: 'Classic Beef Burger', category: 'Fast Food', price: 250.0, initialStock: 25, soldCount: 0 },
  ],
  config: {
    shopName: 'Family Cafe',
    currency: 'Br',
    taxRate: 0,
    serviceRate: 0,
    adminPin: '1234',
    apiId: '',
    apiKey: '',
  },
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

const VALIDATION = {
  pinLength: 4,
  minPrice: 0,
  maxPinAttempts: 3,
  pinLockoutMs: 30000,
  categoryNameMaxLength: 50,
  productNameMaxLength: 100,
  minStock: 0,
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

const UI = {
  transitionDuration: 150,
  modalBackdropBlur: 'backdrop-blur-xs',
  animationFadeIn: 'animate-fade-in',
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SMS_LOGS = [
  'Telebirr Transfer Received: 250.00 Br from Abebe Kebede.',
  'CBE Birr: Received 180.00 Br on Ref: FT261849X.',
  'Telebirr Transfer Received: 35.00 Br from Chala Chaltu.',
];

const SMS_PUSH_INTERVAL = 9000;
const SMS_PUSH_THRESHOLD = 0.4;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

const ERROR_MESSAGES = {
  storageQuotaExceeded: 'Storage quota exceeded. Some data may not be saved.',
  storageNotAvailable: 'Local storage is not available (private browsing mode?).',
  invalidPin: 'Invalid Management Code PIN Security Shield Alert.',
  pinMismatch: 'Current configuration password pin challenge mismatches.',
  invalidPinFormat: 'New secret PIN must be exactly 4 digit integers.',
  categoryExists: 'Category group title string already registered.',
  invalidProduct: 'Verify name and financial registration strings.',
  cartEmpty: 'Add items into the basket blueprint before printing tickets.',
  exceedsStock: 'Cannot exceed live shelf inventory counts.',
  maxStockReached: 'Maximum available shelf stock reached.',
  confirmDelete: 'Purge product catalog entry permanently?',
  confirmFactoryReset: 'Confirm system wipeout? All analytics tracking logs, inventory matrices, and configurations reset.',
};

// ============================================================================
// TRANSACTION PREFIXES
// ============================================================================

const TRANSACTION = {
  idPrefix: 'TX-',
  idMinRange: 100000,
  idMaxRange: 900000,
};

// ============================================================================
// VIEWS
// ============================================================================

const VIEWS = {
  register: 'register',
  stock: 'stock',
  analytics: 'analytics',
  catalog: 'catalog',
  settings: 'settings',
};