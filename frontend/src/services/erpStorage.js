// LocalStorage Keys
const STORAGE_KEYS = {
  INVENTORY: 'mini_erp_inventory_v1',
  CUSTOMERS: 'mini_erp_customers_v1',
  SALES_ORDERS: 'mini_erp_orders_v1',
  BATCHES: 'mini_erp_batches_v1',
  ACTIVITIES: 'mini_erp_activities_v1',
  SETTINGS: 'mini_erp_settings_v1',
  USER_SESSION: 'mini_erp_user_v1',
};

// Default seed data for initial load
export const DEFAULT_INVENTORY = [
  { id: "INV-001", sku: "SKU-9021", name: "Aluminum Extrusion Bar (6063-T6)", category: "Raw Material", stock: 450, minStock: 100, unit: "kg", unitPrice: 280, status: "In Stock" },
  { id: "INV-002", sku: "SKU-8842", name: "Precision Roller Bearing 25mm", category: "Components", stock: 1240, minStock: 300, unit: "pcs", unitPrice: 150, status: "In Stock" },
  { id: "INV-003", sku: "SKU-7721", name: "High-Tensile Hex Bolt M8x40", category: "Hardware", stock: 85, minStock: 200, unit: "boxes", unitPrice: 450, status: "Low Stock" },
  { id: "INV-004", sku: "SKU-6519", name: "Hydraulic Fluid Type IV (20L)", category: "Raw Material", stock: 18, minStock: 15, unit: "drums", unitPrice: 3200, status: "In Stock" },
  { id: "INV-005", sku: "SKU-5402", name: "Tempered Glass Panel 600x800", category: "Finished Goods", stock: 320, minStock: 50, unit: "pcs", unitPrice: 1850, status: "In Stock" },
  { id: "INV-006", sku: "SKU-4310", name: "Heavy Duty Servo Motor 400W", category: "Components", stock: 42, minStock: 20, unit: "pcs", unitPrice: 8500, status: "In Stock" },
  { id: "INV-007", sku: "SKU-3129", name: "Teak Finish Veneer Sheet 4x8ft", category: "Raw Material", stock: 24, minStock: 40, unit: "Sheets", unitPrice: 1200, status: "Low Stock" },
  { id: "INV-008", sku: "SKU-2098", name: "Modular Office Workstation 4-Seater", category: "Finished Goods", stock: 15, minStock: 10, unit: "Units", unitPrice: 24500, status: "In Stock" },
];

export const DEFAULT_CUSTOMERS = [
  { id: "CUST-001", name: "Apex Industrial Corp", contact: "Rajesh Sharma", email: "procurement@apexcorp.in", phone: "+91 98234 11200", city: "Mumbai, MH", tier: "Enterprise Tier", createdAt: "2026-01-15" },
  { id: "CUST-002", name: "Nexus Logistics Ltd", contact: "Anita Deshmukh", email: "contact@nexuslogistics.com", phone: "+91 97120 54321", city: "Pune, MH", tier: "Strategic Partner", createdAt: "2026-02-01" },
  { id: "CUST-003", name: "Zenith Automotive Systems", contact: "Karan Patel", email: "karan@zenithauto.io", phone: "+91 98980 99881", city: "Ahmedabad, GJ", tier: "Enterprise Tier", createdAt: "2026-02-18" },
  { id: "CUST-004", name: "Beacon Energy Solutions", contact: "Priya Nair", email: "priya@beaconenergy.org", phone: "+91 94470 33211", city: "Bengaluru, KA", tier: "Growth Account", createdAt: "2026-03-05" },
  { id: "CUST-005", name: "Horizon Aerospace Technologies", contact: "Vikram Malhotra", email: "supplies@horizonaero.in", phone: "+91 91234 88765", city: "Hyderabad, TS", tier: "Enterprise Tier", createdAt: "2026-04-10" },
];

export const DEFAULT_SALES_ORDERS = [
  {
    id: "SO-2026-0941",
    customerId: "CUST-001",
    customerName: "Apex Industrial Corp",
    date: "2026-08-20",
    items: [
      { productId: "INV-005", productName: "Tempered Glass Panel 600x800", quantity: 60, unitPrice: 1850, total: 111000 },
      { productId: "INV-002", productName: "Precision Roller Bearing 25mm", quantity: 200, unitPrice: 155, total: 31000 }
    ],
    totalAmount: 142000,
    paymentStatus: "Paid",
    fulfillmentStatus: "Ready for Dispatch"
  },
  {
    id: "SO-2026-0940",
    customerId: "CUST-002",
    customerName: "Nexus Logistics Ltd",
    date: "2026-08-20",
    items: [
      { productId: "INV-008", productName: "Modular Office Workstation 4-Seater", quantity: 3, unitPrice: 24500, total: 73500 },
      { productId: "INV-003", productName: "High-Tensile Hex Bolt M8x40", quantity: 33, unitPrice: 450, total: 15000 }
    ],
    totalAmount: 88500,
    paymentStatus: "Pending",
    fulfillmentStatus: "Processing"
  },
  {
    id: "SO-2026-0939",
    customerId: "CUST-003",
    customerName: "Zenith Automotive Systems",
    date: "2026-08-19",
    items: [
      { productId: "INV-006", productName: "Heavy Duty Servo Motor 400W", quantity: 30, unitPrice: 8500, total: 255000 },
      { productId: "INV-001", productName: "Aluminum Extrusion Bar (6063-T6)", quantity: 215, unitPrice: 280, total: 60200 }
    ],
    totalAmount: 315200,
    paymentStatus: "Paid",
    fulfillmentStatus: "In Production"
  },
  {
    id: "SO-2026-0938",
    customerId: "CUST-004",
    customerName: "Beacon Energy Solutions",
    date: "2026-08-19",
    items: [
      { productId: "INV-004", productName: "Hydraulic Fluid Type IV (20L)", quantity: 20, unitPrice: 3200, total: 64000 }
    ],
    totalAmount: 64000,
    paymentStatus: "Paid",
    fulfillmentStatus: "Delivered"
  },
];

export const DEFAULT_BATCHES = [
  {
    id: "BATCH-89",
    productId: "INV-005",
    productName: "Tempered Glass Panel 600x800",
    line: "Line Alpha (CNC Milling)",
    targetQty: 500,
    unit: "pcs",
    progress: 85,
    status: "In Progress",
    startedAt: "2026-08-20",
    targetDate: "2026-08-22"
  },
  {
    id: "BATCH-88",
    productId: "INV-003",
    productName: "High-Tensile Hex Bolt M8x40",
    line: "Line Beta (Stamping)",
    targetQty: 1200,
    unit: "boxes",
    progress: 100,
    status: "Completed",
    startedAt: "2026-08-18",
    targetDate: "2026-08-20"
  },
  {
    id: "BATCH-87",
    productId: "INV-001",
    productName: "Aluminum Extrusion Bar (6063-T6)",
    line: "Line Gamma (Anodizing)",
    targetQty: 350,
    unit: "kg",
    progress: 40,
    status: "In Progress",
    startedAt: "2026-08-19",
    targetDate: "2026-08-23"
  },
  {
    id: "BATCH-86",
    productId: "INV-008",
    productName: "Modular Office Workstation 4-Seater",
    line: "Line Delta (Assembly)",
    targetQty: 25,
    unit: "Units",
    progress: 15,
    status: "Queued",
    startedAt: "2026-08-21",
    targetDate: "2026-08-28"
  }
];

export const DEFAULT_ACTIVITIES = [
  { id: "ACT-01", type: "order", text: "Order #SO-2026-0941 approved for dispatch (Apex Industrial Corp)", timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "ACT-02", type: "stock", text: "Stock adjusted: Aluminum Extrusion Bar (450 kg)", timestamp: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: "ACT-03", type: "alert", text: "Low stock alert: High-Tensile Hex Bolt is below 200 boxes threshold", timestamp: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: "ACT-04", type: "customer", text: "Horizon Aerospace Technologies registered as Enterprise Client", timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: "ACT-05", type: "production", text: "Quality inspection passed for Batch #88 (Reinforced Brackets)", timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
];

export const DEFAULT_SETTINGS = {
  orgName: "Mini-ERP Industrial Solutions Pvt Ltd",
  orgEmail: "admin@minierp-solutions.com",
  orgPhone: "+91 22 4589 0000",
  currency: "INR",
  currencySymbol: "₹",
  taxRate: 18,
  lowStockThresholdPercent: 20,
  twoFactorAuth: true,
  autoReorderAlerts: true,
  emailNotifications: true,
};

export const DEFAULT_USER = {
  name: "Alexander Reed",
  email: "a.reed@minierp.io",
  role: "Operations Director",
  avatar: "AR",
};

// Safe LocalStorage helpers
export const loadData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
};

export const saveData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
};

export const storage = {
  getInventory: () => loadData(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY),
  setInventory: (data) => saveData(STORAGE_KEYS.INVENTORY, data),

  getCustomers: () => loadData(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS),
  setCustomers: (data) => saveData(STORAGE_KEYS.CUSTOMERS, data),

  getOrders: () => loadData(STORAGE_KEYS.SALES_ORDERS, DEFAULT_SALES_ORDERS),
  setOrders: (data) => saveData(STORAGE_KEYS.SALES_ORDERS, data),

  getBatches: () => loadData(STORAGE_KEYS.BATCHES, DEFAULT_BATCHES),
  setBatches: (data) => saveData(STORAGE_KEYS.BATCHES, data),

  getActivities: () => loadData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES),
  setActivities: (data) => saveData(STORAGE_KEYS.ACTIVITIES, data),

  getSettings: () => loadData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  setSettings: (data) => saveData(STORAGE_KEYS.SETTINGS, data),

  getUser: () => loadData(STORAGE_KEYS.USER_SESSION, DEFAULT_USER),
  setUser: (data) => saveData(STORAGE_KEYS.USER_SESSION, data),

  resetAll: () => {
    saveData(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
    saveData(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    saveData(STORAGE_KEYS.SALES_ORDERS, DEFAULT_SALES_ORDERS);
    saveData(STORAGE_KEYS.BATCHES, DEFAULT_BATCHES);
    saveData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
    saveData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    saveData(STORAGE_KEYS.USER_SESSION, DEFAULT_USER);
  },

  clearAll: () => {
    saveData(STORAGE_KEYS.INVENTORY, []);
    saveData(STORAGE_KEYS.CUSTOMERS, []);
    saveData(STORAGE_KEYS.SALES_ORDERS, []);
    saveData(STORAGE_KEYS.BATCHES, []);
    saveData(STORAGE_KEYS.ACTIVITIES, []);
    saveData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
};
