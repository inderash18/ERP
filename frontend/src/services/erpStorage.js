// LocalStorage Keys
const STORAGE_KEYS = {
  PRODUCTS: 'mini_erp_products_v2',
  INVENTORY: 'mini_erp_inventory_v2', // Backwards compat
  STOCK_MOVEMENTS: 'mini_erp_stock_movements_v2',
  SUPPLIERS: 'mini_erp_suppliers_v2',
  PURCHASE_ORDERS: 'mini_erp_purchase_orders_v2',
  BOMS: 'mini_erp_boms_v2',
  WORK_ORDERS: 'mini_erp_work_orders_v2',
  PROCUREMENT_RECS: 'mini_erp_procurement_recs_v2',
  AUDIT_LOGS: 'mini_erp_audit_logs_v2',
  
  CUSTOMERS: 'mini_erp_customers_v2',
  SALES_ORDERS: 'mini_erp_sales_orders_v2',
  BATCHES: 'mini_erp_batches_v2', // Backwards compat
  ACTIVITIES: 'mini_erp_activities_v2',
  SETTINGS: 'mini_erp_settings_v2',
  USER_SESSION: 'mini_erp_user_v2',
  MANAGED_USERS: 'mini_erp_managed_users_v2',
  ROLE_MATRIX: 'mini_erp_role_matrix_v2',
  EMPLOYEE_MASTER: 'mini_erp_employee_master_v2',
};

export const DEFAULT_PRODUCTS = [
  // Finished Goods
  { id: "PRD-001", sku: "FG-TBL-STUDY", name: "Wooden Study Table", category: "Tables", type: "Finished Good", stock: 3, minStock: 10, targetStock: 20, unit: "units", purchasePrice: 0, sellingPrice: 4500, status: "Low Stock", supplierId: null, imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&q=80" },
  { id: "PRD-002", sku: "FG-CHR-OFFC", name: "Office Chair", category: "Chairs", type: "Finished Good", stock: 15, minStock: 10, targetStock: 30, unit: "units", purchasePrice: 0, sellingPrice: 3200, status: "In Stock", supplierId: null, imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80" },
  { id: "PRD-003", sku: "FG-CAB-WOOD", name: "Wooden Cabinet", category: "Storage", type: "Finished Good", stock: 10, minStock: 5, targetStock: 15, unit: "units", purchasePrice: 0, sellingPrice: 8500, status: "In Stock", supplierId: null, imageUrl: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=80" },
  { id: "PRD-004", sku: "FG-TBL-DINE", name: "Dining Table", category: "Tables", type: "Finished Good", stock: 5, minStock: 5, targetStock: 10, unit: "units", purchasePrice: 0, sellingPrice: 12000, status: "Low Stock", supplierId: null, imageUrl: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=500&q=80" },
  // Raw Materials
  { id: "PRD-005", sku: "RM-WOOD-PNL", name: "Wood Panel", category: "Wood", type: "Raw Material", stock: 10, minStock: 50, targetStock: 200, unit: "pcs", purchasePrice: 400, sellingPrice: 0, status: "Low Stock", supplierId: "SUP-001" },
  { id: "PRD-006", sku: "RM-SCRW-16", name: "Screws", category: "Hardware", type: "Raw Material", stock: 100, minStock: 1000, targetStock: 5000, unit: "pcs", purchasePrice: 2, sellingPrice: 0, status: "In Stock", supplierId: "SUP-002" },
  { id: "PRD-007", sku: "RM-POL-WOOD", name: "Wood Polish", category: "Finishing", type: "Raw Material", stock: 5, minStock: 20, targetStock: 50, unit: "L", purchasePrice: 350, sellingPrice: 0, status: "Low Stock", supplierId: "SUP-003" },
  // Components
  { id: "PRD-008", sku: "CMP-TBL-LEG", name: "Table Leg", category: "Wood", type: "Component", stock: 20, minStock: 40, targetStock: 100, unit: "pcs", purchasePrice: 150, sellingPrice: 0, status: "Low Stock", supplierId: "SUP-001" },
  { id: "PRD-009", sku: "CMP-MTL-FRM", name: "Metal Frame", category: "Hardware", type: "Component", stock: 10, minStock: 20, targetStock: 50, unit: "pcs", purchasePrice: 800, sellingPrice: 0, status: "Low Stock", supplierId: "SUP-002" },
  { id: "PRD-010", sku: "CMP-CHR-CSH", name: "Chair Cushion", category: "Upholstery", type: "Component", stock: 40, minStock: 30, targetStock: 100, unit: "pcs", purchasePrice: 250, sellingPrice: 0, status: "In Stock", supplierId: "SUP-003" },
];

export const DEFAULT_INVENTORY = DEFAULT_PRODUCTS;

export const DEFAULT_SUPPLIERS = [
  { id: "SUP-001", code: "VEND-TIMB", name: "Local Timber Co.", contactPerson: "Rajiv Desai", email: "sales@localtimber.in", phone: "+91 98765 11111", address: "Timber Market, Pune", paymentTerms: "Net 30", status: "Active" },
  { id: "SUP-002", code: "VEND-FAST", name: "Fasteners India", contactPerson: "Amit Shah", email: "orders@fasteners.in", phone: "+91 98765 22222", address: "GIDC, Ahmedabad", paymentTerms: "Net 15", status: "Active" },
  { id: "SUP-003", code: "VEND-UNIV", name: "Universal Furniture Parts", contactPerson: "Sonal Mehta", email: "supply@universalparts.in", phone: "+91 98765 33333", address: "Andheri, Mumbai", paymentTerms: "Prepaid", status: "Active" },
];

export const DEFAULT_BOMS = [
  {
    id: "BOM-001",
    productId: "PRD-001", // Wooden Study Table
    productName: "Wooden Study Table",
    quantity: 1, // To make 1 table
    components: [
      { productId: "PRD-005", productName: "Wood Panel", quantity: 2, unit: "pcs" },
      { productId: "PRD-008", productName: "Table Leg", quantity: 4, unit: "pcs" },
      { productId: "PRD-006", productName: "Screws", quantity: 16, unit: "pcs" },
      { productId: "PRD-007", productName: "Wood Polish", quantity: 0.2, unit: "L" },
    ]
  },
  {
    id: "BOM-002",
    productId: "PRD-002", // Office Chair
    productName: "Office Chair",
    quantity: 1,
    components: [
      { productId: "PRD-009", productName: "Metal Frame", quantity: 1, unit: "pcs" },
      { productId: "PRD-010", productName: "Chair Cushion", quantity: 2, unit: "pcs" },
      { productId: "PRD-006", productName: "Screws", quantity: 8, unit: "pcs" },
    ]
  }
];

export const DEFAULT_CUSTOMERS = [
  { id: "CUST-001", name: "Urban Home Decor", contact: "Vikram Singh", email: "purchasing@urbanhome.in", phone: "+91 99887 77665", city: "Mumbai, MH", tier: "Enterprise Tier", createdAt: "2026-01-15" },
  { id: "CUST-002", name: "Office Spaces Ltd", contact: "Neha Sharma", email: "neha@officespaces.co.in", phone: "+91 98765 54321", city: "Pune, MH", tier: "Strategic Partner", createdAt: "2026-02-01" },
];

export const DEFAULT_SALES_ORDERS = [
  {
    id: "SO-2026-1001",
    customerId: "CUST-002",
    customerName: "Office Spaces Ltd",
    date: new Date().toISOString().split('T')[0],
    items: [
      { productId: "PRD-001", productName: "Wooden Study Table", quantity: 10, unitPrice: 4500, total: 45000 }
    ],
    totalAmount: 45000,
    paymentStatus: "Pending",
    fulfillmentStatus: "Processing" // This is our MTO scenario
  }
];

export const DEFAULT_PURCHASE_ORDERS = [];
export const DEFAULT_WORK_ORDERS = [];
export const DEFAULT_STOCK_MOVEMENTS = [];
export const DEFAULT_PROCUREMENT_RECS = [];
export const DEFAULT_AUDIT_LOGS = [];
export const DEFAULT_BATCHES = []; 
export const DEFAULT_ACTIVITIES = [
  { id: "ACT-01", type: "order", text: "New Sales Order SO-2026-1001 placed for 10 Wooden Study Tables", timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
];

export const DEFAULT_SETTINGS = {
  orgName: "Shiv Furniture Works",
  orgEmail: "contact@shivfurniture.in",
  orgPhone: "+91 22 1234 5678",
  currency: "INR",
  currencySymbol: "₹",
  taxRate: 18,
  lowStockThresholdPercent: 20,
  twoFactorAuth: false,
  autoReorderAlerts: true,
  emailNotifications: true,
};

export const DEFAULT_USER = {
  name: "System Admin",
  email: "admin@shivfurniture.in",
  role: "System Administrator",
  avatar: "SA",
};

export const DEFAULT_ROLE_MATRIX = [];
export const DEFAULT_MANAGED_USERS = [];

export const DEFAULT_EMPLOYEE_MASTER = [
  { id: "EMP-001", employeeId: "OWNER01", employeeName: "Arjun Shiv", department: "Executive", role: "Business Owner", status: "Active", email: "arjun@shivfurniture.in", phone: "9876543210", accountCreated: false, createdAt: new Date().toISOString() },
  { id: "EMP-002", employeeId: "ADMIN01", employeeName: "System Admin", department: "IT", role: "Admin", status: "Active", email: "admin@shivfurniture.in", phone: "9876543211", accountCreated: false, createdAt: new Date().toISOString() },
  { id: "EMP-003", employeeId: "ADMIN02", employeeName: "IT Support", department: "IT", role: "Admin", status: "Active", email: "support@shivfurniture.in", phone: "9876543212", accountCreated: false, createdAt: new Date().toISOString() },
  ...Array.from({length: 10}).map((_, i) => ({ id: `EMP-1${String(i).padStart(2,'0')}`, employeeId: `SALE${String(i+1).padStart(2,'0')}`, employeeName: `Sales Rep ${i+1}`, department: "Sales", role: "Sales User", status: "Active", email: `sale${i+1}@shivfurniture.in`, phone: `98765431${i}0`, accountCreated: false, createdAt: new Date().toISOString() })),
  ...Array.from({length: 10}).map((_, i) => ({ id: `EMP-2${String(i).padStart(2,'0')}`, employeeId: `PUR${String(i+1).padStart(2,'0')}`, employeeName: `Purchase Agent ${i+1}`, department: "Procurement", role: "Purchase User", status: "Active", email: `pur${i+1}@shivfurniture.in`, phone: `98765432${i}0`, accountCreated: false, createdAt: new Date().toISOString() })),
  ...Array.from({length: 10}).map((_, i) => ({ id: `EMP-3${String(i).padStart(2,'0')}`, employeeId: `MFG${String(i+1).padStart(2,'0')}`, employeeName: `Mfg Engineer ${i+1}`, department: "Manufacturing", role: "Manufacturing User", status: "Active", email: `mfg${i+1}@shivfurniture.in`, phone: `98765433${i}0`, accountCreated: false, createdAt: new Date().toISOString() })),
  ...Array.from({length: 5}).map((_, i) => ({ id: `EMP-4${String(i).padStart(2,'0')}`, employeeId: `INV${String(i+1).padStart(2,'0')}`, employeeName: `Inventory Mgr ${i+1}`, department: "Warehouse", role: "Inventory Manager", status: "Active", email: `inv${i+1}@shivfurniture.in`, phone: `98765434${i}0`, accountCreated: false, createdAt: new Date().toISOString() })),
];

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
  getEmployees: () => loadData(STORAGE_KEYS.EMPLOYEE_MASTER, DEFAULT_EMPLOYEE_MASTER),
  setEmployees: (data) => saveData(STORAGE_KEYS.EMPLOYEE_MASTER, data),

  getProducts: () => loadData(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS),
  setProducts: (data) => saveData(STORAGE_KEYS.PRODUCTS, data),

  getSuppliers: () => loadData(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS),
  setSuppliers: (data) => saveData(STORAGE_KEYS.SUPPLIERS, data),

  getPurchaseOrders: () => loadData(STORAGE_KEYS.PURCHASE_ORDERS, DEFAULT_PURCHASE_ORDERS),
  setPurchaseOrders: (data) => saveData(STORAGE_KEYS.PURCHASE_ORDERS, data),

  getBoms: () => loadData(STORAGE_KEYS.BOMS, DEFAULT_BOMS),
  setBoms: (data) => saveData(STORAGE_KEYS.BOMS, data),

  getWorkOrders: () => loadData(STORAGE_KEYS.WORK_ORDERS, DEFAULT_WORK_ORDERS),
  setWorkOrders: (data) => saveData(STORAGE_KEYS.WORK_ORDERS, data),

  getStockMovements: () => loadData(STORAGE_KEYS.STOCK_MOVEMENTS, DEFAULT_STOCK_MOVEMENTS),
  setStockMovements: (data) => saveData(STORAGE_KEYS.STOCK_MOVEMENTS, data),

  getProcurementRecs: () => loadData(STORAGE_KEYS.PROCUREMENT_RECS, DEFAULT_PROCUREMENT_RECS),
  setProcurementRecs: (data) => saveData(STORAGE_KEYS.PROCUREMENT_RECS, data),

  getAuditLogs: () => loadData(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS),
  setAuditLogs: (data) => saveData(STORAGE_KEYS.AUDIT_LOGS, data),

  // Backwards compat
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

  getManagedUsers: () => loadData(STORAGE_KEYS.MANAGED_USERS, DEFAULT_MANAGED_USERS),
  setManagedUsers: (data) => saveData(STORAGE_KEYS.MANAGED_USERS, data),

  getRoleMatrix: () => loadData(STORAGE_KEYS.ROLE_MATRIX, DEFAULT_ROLE_MATRIX),
  setRoleMatrix: (data) => saveData(STORAGE_KEYS.ROLE_MATRIX, data),

  seedShivFurnitureDemoData: () => {
    // Only seed employees if none exist
    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEE_MASTER)) {
      saveData(STORAGE_KEYS.EMPLOYEE_MASTER, DEFAULT_EMPLOYEE_MASTER);
    }
    saveData(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    saveData(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
    saveData(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
    saveData(STORAGE_KEYS.PURCHASE_ORDERS, DEFAULT_PURCHASE_ORDERS);
    saveData(STORAGE_KEYS.BOMS, DEFAULT_BOMS);
    saveData(STORAGE_KEYS.WORK_ORDERS, DEFAULT_WORK_ORDERS);
    saveData(STORAGE_KEYS.STOCK_MOVEMENTS, DEFAULT_STOCK_MOVEMENTS);
    saveData(STORAGE_KEYS.PROCUREMENT_RECS, DEFAULT_PROCUREMENT_RECS);
    saveData(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
    
    saveData(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    saveData(STORAGE_KEYS.SALES_ORDERS, DEFAULT_SALES_ORDERS);
    saveData(STORAGE_KEYS.BATCHES, DEFAULT_BATCHES);
    saveData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
    saveData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    saveData(STORAGE_KEYS.USER_SESSION, DEFAULT_USER);
    saveData(STORAGE_KEYS.MANAGED_USERS, DEFAULT_MANAGED_USERS);
    saveData(STORAGE_KEYS.ROLE_MATRIX, DEFAULT_ROLE_MATRIX);
  },

  resetAll: () => {
    storage.seedShivFurnitureDemoData();
  },

  clearAll: () => {
    saveData(STORAGE_KEYS.EMPLOYEE_MASTER, []);
    saveData(STORAGE_KEYS.PRODUCTS, []);
    saveData(STORAGE_KEYS.INVENTORY, []);
    saveData(STORAGE_KEYS.SUPPLIERS, []);
    saveData(STORAGE_KEYS.PURCHASE_ORDERS, []);
    saveData(STORAGE_KEYS.BOMS, []);
    saveData(STORAGE_KEYS.WORK_ORDERS, []);
    saveData(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    saveData(STORAGE_KEYS.PROCUREMENT_RECS, []);
    saveData(STORAGE_KEYS.AUDIT_LOGS, []);
    saveData(STORAGE_KEYS.CUSTOMERS, []);
    saveData(STORAGE_KEYS.SALES_ORDERS, []);
    saveData(STORAGE_KEYS.BATCHES, []);
    saveData(STORAGE_KEYS.ACTIVITIES, []);
    saveData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    saveData(STORAGE_KEYS.MANAGED_USERS, []);
  }
};
