import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storage, DEFAULT_SETTINGS, DEFAULT_USER, DEFAULT_MANAGED_USERS, DEFAULT_ROLE_MATRIX } from '../services/erpStorage';
import { apiCall } from '../lib/api';

const ErpContext = createContext(null);

export function ErpProvider({ children }) {
  // ----------------------------------------------------
  // ERP DATA STATE (from LocalStorage)
  // ----------------------------------------------------
  const [employees, setEmployees] = useState(() => storage.getEmployees() || []);
  const [products, setProducts] = useState(() => storage.getProducts() || []);
  const [suppliers, setSuppliers] = useState(() => storage.getSuppliers() || []);
  const [purchaseOrders, setPurchaseOrders] = useState(() => storage.getPurchaseOrders() || []);
  const [boms, setBoms] = useState(() => storage.getBoms() || []);
  const [workOrders, setWorkOrders] = useState(() => storage.getWorkOrders() || []);
  const [stockMovements, setStockMovements] = useState(() => storage.getStockMovements() || []);
  const [procurementRecs, setProcurementRecs] = useState(() => storage.getProcurementRecs() || []);
  const [auditLogs, setAuditLogs] = useState(() => storage.getAuditLogs() || []);

  const [inventory, setInventory] = useState(() => storage.getInventory() || []);
  const [customers, setCustomers] = useState(() => storage.getCustomers() || []);
  const [orders, setOrders] = useState(() => storage.getOrders() || []);
  const [batches, setBatches] = useState(() => storage.getBatches() || []);
  const [activities, setActivities] = useState(() => storage.getActivities() || []);
  const [settings, setSettings] = useState(() => storage.getSettings() || {});
  
  const [user, setUser] = useState(() => storage.getUser() || {});
  const [managedUsers, setManagedUsers] = useState(() => storage.getManagedUsers() || DEFAULT_MANAGED_USERS);
  const [roleMatrix, setRoleMatrix] = useState(() => storage.getRoleMatrix() || DEFAULT_ROLE_MATRIX);

  // ----------------------------------------------------
  // REAL BACKEND AUTHENTICATION STATE
  // ----------------------------------------------------
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mini_erp_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ----------------------------------------------------
  // ROLE PERMISSIONS MATRIX
  // ----------------------------------------------------
  const rolePermissions = useMemo(() => ({
    'Admin': ['all'],
    'Business Owner': ['all'],
    'Sales User': ['sales.view', 'sales.create', 'sales.edit', 'inventory.view', 'customers.view'],
    'Purchase User': ['purchase.view', 'purchase.create', 'purchase.edit', 'inventory.view', 'suppliers.view'],
    'Manufacturing User': ['manufacturing.view', 'manufacturing.create', 'manufacturing.edit', 'inventory.view', 'bom.view'],
    'Inventory Manager': ['inventory.view', 'inventory.create', 'inventory.edit', 'stock.adjust']
  }), []);

  const hasPermission = useCallback((permission) => {
    const role = authUser?.role || user?.role;
    if (!role) return false;
    const perms = rolePermissions[role] || [];
    return perms.includes('all') || perms.includes(permission);
  }, [authUser, user, rolePermissions]);

  // Session verification on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await apiCall('/auth/me');
          if (res?.data) {
            const uData = {
              _id: res.data._id,
              firstName: res.data.firstName,
              lastName: res.data.lastName,
              name: `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim(),
              email: res.data.email,
              role: res.data.role?.name || res.data.role || 'USER',
              organizationId: res.data.organizationId
            };
            setAuthUser(uData);
            localStorage.setItem('mini_erp_auth_user', JSON.stringify(uData));
          }
        } catch (err) {
          console.warn('Authentication token expired or invalid:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('mini_erp_auth_user');
          setAuthUser(null);
          setToken(null);
        }
      }
      setIsAuthLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = useCallback(async (employeeId, password, asAdmin = false) => {
    const eid = employeeId.trim().toUpperCase();
    const employee = employees.find(e => e.employeeId === eid);
    
    if (!employee) {
      throw new Error('Invalid Employee ID. Please contact your administrator.');
    }
    
    if (employee.status !== 'Active') {
      throw new Error(`Your account is ${employee.status}. Please contact the administrator.`);
    }

    if (!employee.accountCreated) {
      throw new Error('No account found for this Employee ID. Please sign up first.');
    }

    // Since we are mocking the backend for demo purposes and using Employee IDs, 
    // we bypass the actual API login which expects an email format.
    const userData = {
      _id: employee.id,
      name: employee.employeeName,
      email: employee.email,
      role: employee.role,
      employeeId: employee.employeeId,
      department: employee.department,
      token: `demo-token-${employee.employeeId}-${Date.now()}`
    };

    const roleName = (userData.role || '').toUpperCase();
    const isAdmin = roleName === 'ADMIN' || roleName === 'SYSTEM ADMINISTRATOR';

    if (asAdmin && !isAdmin) {
      throw new Error('Access denied. Administrator privileges required to access Admin portal.');
    }

    localStorage.setItem('token', userData.token);
    localStorage.setItem('mini_erp_auth_user', JSON.stringify(userData));
    setToken(userData.token);
    setAuthUser(userData);

    logActivity('alert', `User authenticated: ${userData.name} (${userData.role})`);
    createAuditLog('Login', 'Auth', userData.employeeId, 'User logged in successfully');
    return userData;
  }, [employees]); // NOTE: logActivity & createAuditLog aren't in deps yet to avoid circular, they are handled loosely here

  const signupUser = useCallback(async ({ name, employeeId, password }) => {
    const eid = employeeId.trim().toUpperCase();
    const employee = employees.find(e => e.employeeId === eid);

    if (!employee) {
      throw new Error('Invalid Employee ID. Please contact your administrator.');
    }

    if (employee.status !== 'Active') {
      throw new Error(`Your account is ${employee.status}. Please contact the administrator.`);
    }

    if (employee.accountCreated) {
      throw new Error('An account already exists for this Employee ID.');
    }

    // Create the account locally
    const userData = {
      _id: employee.id,
      name: employee.employeeName,
      email: employee.email,
      role: employee.role,
      employeeId: employee.employeeId,
      department: employee.department,
      token: `demo-token-${employee.employeeId}-${Date.now()}`
    };

    // Update the employee master
    setEmployees(prev => prev.map(e => e.employeeId === eid ? { ...e, accountCreated: true } : e));

    localStorage.setItem('token', userData.token);
    localStorage.setItem('mini_erp_auth_user', JSON.stringify(userData));
    setToken(userData.token);
    setAuthUser(userData);

    // Using setTimeout to defer to next tick so createAuditLog/logActivity are initialized
    setTimeout(() => {
      logActivity('alert', `New Employee Account Created: ${userData.name} (${userData.role})`);
      createAuditLog('Signup', 'Auth', userData.employeeId, 'New user registered via Employee ID');
    }, 100);

    return userData;
  }, [employees]);

  const logoutUser = useCallback(async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('mini_erp_auth_user');
    setToken(null);
    setAuthUser(null);
  }, []);

  // Save to storage on state change
  useEffect(() => { storage.setEmployees(employees); }, [employees]);
  useEffect(() => { storage.setProducts(products); }, [products]);
  useEffect(() => { storage.setSuppliers(suppliers); }, [suppliers]);
  useEffect(() => { storage.setPurchaseOrders(purchaseOrders); }, [purchaseOrders]);
  useEffect(() => { storage.setBoms(boms); }, [boms]);
  useEffect(() => { storage.setWorkOrders(workOrders); }, [workOrders]);
  useEffect(() => { storage.setStockMovements(stockMovements); }, [stockMovements]);
  useEffect(() => { storage.setProcurementRecs(procurementRecs); }, [procurementRecs]);
  useEffect(() => { storage.setAuditLogs(auditLogs); }, [auditLogs]);
  
  useEffect(() => { storage.setInventory(inventory); }, [inventory]);
  useEffect(() => { storage.setCustomers(customers); }, [customers]);
  useEffect(() => { storage.setOrders(orders); }, [orders]);
  useEffect(() => { storage.setBatches(batches); }, [batches]);
  useEffect(() => { storage.setActivities(activities); }, [activities]);
  useEffect(() => { storage.setSettings(settings); }, [settings]);
  useEffect(() => { storage.setUser(user); }, [user]);
  useEffect(() => { storage.setManagedUsers(managedUsers); }, [managedUsers]);
  useEffect(() => { storage.setRoleMatrix(roleMatrix); }, [roleMatrix]);

  // ----------------------------------------------------
  // CORE ERP LOGIC & UTILITIES
  // ----------------------------------------------------

  // 1. Audit Logs
  const createAuditLog = useCallback((action, module, referenceId, description) => {
    const userEmail = authUser?.email || user?.email || 'System';
    const log = {
      id: `AL-${Date.now()}`,
      action,
      module,
      referenceId,
      user: userEmail,
      timestamp: new Date().toISOString(),
      description
    };
    setAuditLogs(prev => [log, ...prev]);
  }, [authUser, user]);

  // Activity Feed (Dashboard)
  const logActivity = useCallback((type, text) => {
    const newAct = {
      id: `ACT-${Date.now()}`,
      type,
      text,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev.slice(0, 49)]);
  }, []);

  // 2. Stock Movements
  const addStockMovement = useCallback((movementData) => {
    const { productId, type, quantity, referenceType, referenceId } = movementData;
    const movement = {
      id: `SM-${Date.now()}`,
      productId,
      type,
      quantity: Number(quantity),
      referenceType,
      referenceId,
      date: new Date().toISOString(),
      user: authUser?.email || user?.email || 'System'
    };

    setStockMovements(prev => [movement, ...prev]);

    // Update Product Stock
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + Number(quantity));
        const status = newStock <= p.minStock ? 'Low Stock' : 'In Stock';
        return { ...p, stock: newStock, status };
      }
      return p;
    }));

    // Update Inventory Stock (For backwards compatibility)
    setInventory(prev => prev.map(i => {
      if (i.id === productId) {
        const newStock = Math.max(0, i.stock + Number(quantity));
        const status = newStock <= i.minStock ? 'Low Stock' : 'In Stock';
        return { ...i, stock: newStock, status };
      }
      return i;
    }));

    createAuditLog(type, 'Inventory', referenceId || productId, `Stock adjustment for ${productId}: ${quantity > 0 ? '+' : ''}${quantity}`);
    
    return movement;
  }, [authUser, user, createAuditLog]);


  // Format currency
  const formatCurrency = useCallback((amount) => {
    const sym = settings?.currencySymbol || '₹';
    const num = Number(amount) || 0;
    return `${sym}${num.toLocaleString('en-IN')}`;
  }, [settings?.currencySymbol]);


  // ----------------------------------------------------
  // PRODUCTS & INVENTORY ACTIONS
  // ----------------------------------------------------
  
  // NOTE: This will replace `addInventoryItem` long term
  const addProduct = useCallback((productData) => {
    const id = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    const newProduct = {
      ...productData,
      id,
      sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: Number(productData.stock) || 0,
      minStock: Number(productData.minStock) || 10,
      targetStock: Number(productData.targetStock) || 50,
      purchasePrice: Number(productData.purchasePrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      status: (Number(productData.stock) || 0) <= (Number(productData.minStock) || 10) ? 'Low Stock' : 'In Stock'
    };
    
    setProducts(prev => [newProduct, ...prev]);
    setInventory(prev => [newProduct, ...prev]); // Backwards compat
    logActivity('stock', `Added new product: ${newProduct.name}`);
    createAuditLog('Create', 'Products', id, `Created product ${newProduct.name}`);
    return newProduct;
  }, [products.length, logActivity, createAuditLog]);

  const updateProduct = useCallback((id, updates) => {
    const applyUpdate = item => {
      if (item.id === id) {
        const merged = { ...item, ...updates };
        merged.stock = Number(merged.stock) || 0;
        merged.minStock = Number(merged.minStock) || 0;
        merged.status = merged.stock <= merged.minStock ? 'Low Stock' : 'In Stock';
        return merged;
      }
      return item;
    };
    setProducts(prev => prev.map(applyUpdate));
    setInventory(prev => prev.map(applyUpdate));
    createAuditLog('Update', 'Products', id, `Updated product details`);
  }, [createAuditLog]);

  const deleteProduct = useCallback((id) => {
    const target = products.find(i => i.id === id);
    setProducts(prev => prev.filter(i => i.id !== id));
    setInventory(prev => prev.filter(i => i.id !== id));
    if (target) {
      logActivity('stock', `Deleted product: ${target.name}`);
      createAuditLog('Delete', 'Products', id, `Deleted product ${target.name}`);
    }
  }, [products, logActivity, createAuditLog]);


  // Old inventory functions mapped to new flow
  const addInventoryItem = addProduct;
  const updateInventoryItem = updateProduct;
  const deleteInventoryItem = deleteProduct;
  
  const adjustStock = useCallback((id, delta) => {
    addStockMovement({
      productId: id,
      type: 'STOCK_ADJUSTMENT',
      quantity: delta,
      referenceType: 'Manual',
      referenceId: 'N/A'
    });
  }, [addStockMovement]);


  // ----------------------------------------------------
  // SUPPLIER ACTIONS
  // ----------------------------------------------------
  const addSupplier = useCallback((supplierData) => {
    const id = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
    const newSupplier = { ...supplierData, id };
    setSuppliers(prev => [newSupplier, ...prev]);
    logActivity('alert', `Registered new supplier: ${newSupplier.name}`);
    createAuditLog('Create', 'Suppliers', id, `Registered new supplier ${newSupplier.name}`);
    return newSupplier;
  }, [suppliers.length, logActivity, createAuditLog]);

  const updateSupplier = useCallback((id, updates) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    createAuditLog('Update', 'Suppliers', id, `Updated supplier record`);
  }, [createAuditLog]);

  const deleteSupplier = useCallback((id) => {
    const target = suppliers.find(s => s.id === id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    if (target) {
      logActivity('alert', `Removed supplier: ${target.name}`);
      createAuditLog('Delete', 'Suppliers', id, `Removed supplier ${target.name}`);
    }
  }, [suppliers, logActivity, createAuditLog]);

  // ----------------------------------------------------
  // CUSTOMER ACTIONS
  // ----------------------------------------------------
  const addCustomer = useCallback((custData) => {
    const id = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const newCust = {
      ...custData,
      id,
      tier: custData.tier || 'Growth Account',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers(prev => [newCust, ...prev]);
    logActivity('customer', `Registered new client: ${newCust.name} (${newCust.tier})`);
    createAuditLog('Create', 'Customers', id, `Registered new client ${newCust.name}`);
    return newCust;
  }, [customers.length, logActivity, createAuditLog]);

  const updateCustomer = useCallback((id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    createAuditLog('Update', 'Customers', id, `Updated client record`);
  }, [createAuditLog]);

  const deleteCustomer = useCallback((id) => {
    const target = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    if (target) {
      logActivity('customer', `Removed client: ${target.name}`);
      createAuditLog('Delete', 'Customers', id, `Removed client ${target.name}`);
    }
  }, [customers, logActivity, createAuditLog]);

  // ----------------------------------------------------
  // PURCHASE ORDER ACTIONS
  // ----------------------------------------------------
  const createPurchaseOrder = useCallback((poData) => {
    const id = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = poData.items || [];
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

    const newPO = {
      id,
      supplierId: poData.supplierId,
      supplierName: poData.supplierName,
      date: new Date().toISOString().split('T')[0],
      expectedDate: poData.expectedDate || '',
      items,
      totalAmount,
      status: 'Draft',
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    logActivity('order', `Created Purchase Order #${id} for ${newPO.supplierName}`);
    createAuditLog('Create', 'Purchase', id, `Created PO for ${newPO.supplierName}`);
    return newPO;
  }, [logActivity, createAuditLog]);

  const updatePurchaseOrderStatus = useCallback((id, status) => {
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status } : po));
    createAuditLog('Update', 'Purchase', id, `Status updated to ${status}`);
  }, [createAuditLog]);

  const receivePurchaseOrder = useCallback((id) => {
    const target = purchaseOrders.find(po => po.id === id);
    if (!target) return;

    if (target.status === 'Received') {
      alert("This Purchase Order has already been received.");
      return;
    }

    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status: 'Received' } : po));

    target.items.forEach(item => {
      addStockMovement({
        productId: item.productId,
        type: 'PURCHASE_IN',
        quantity: Number(item.quantity),
        referenceType: 'PurchaseOrder',
        referenceId: id
      });
    });

    logActivity('stock', `Received Goods for PO #${id}`);
    createAuditLog('Receive', 'Purchase', id, `Received Goods for PO #${id}`);
  }, [purchaseOrders, addStockMovement, logActivity, createAuditLog]);

  // ----------------------------------------------------
  // SALES ORDER ACTIONS
  // ----------------------------------------------------
  const createSalesOrder = useCallback((orderData) => {
    const year = new Date().getFullYear();
    const seq = Math.floor(1000 + Math.random() * 9000);
    const id = `SO-${year}-${seq}`;

    const items = orderData.items || [];
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

    const newOrder = {
      id,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      date: new Date().toISOString().split('T')[0],
      items,
      totalAmount,
      paymentStatus: orderData.paymentStatus || 'Pending',
      fulfillmentStatus: orderData.fulfillmentStatus || 'Processing',
    };

    // In the new flow, stock is checked and deducted during fulfillment or MTO process.
    // We only create the order here.

    setOrders(prev => [newOrder, ...prev]);
    logActivity('order', `New Sales Order created: #${id} for ${newOrder.customerName}`);
    createAuditLog('Create', 'Sales', id, `Created sales order for ${newOrder.customerName}`);
    return newOrder;
  }, [logActivity, createAuditLog]);

  const updateOrderStatus = useCallback((orderId, fulfillmentStatus, paymentStatus) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          ...(fulfillmentStatus !== undefined ? { fulfillmentStatus } : {}),
          ...(paymentStatus !== undefined ? { paymentStatus } : {})
        };
      }
      return ord;
    }));
    logActivity('order', `Order #${orderId} status updated: ${fulfillmentStatus || ''} ${paymentStatus ? `[${paymentStatus}]` : ''}`);
    createAuditLog('Update', 'Sales', orderId, `Status updated to ${fulfillmentStatus}`);
  }, [logActivity, createAuditLog]);

  const deleteSalesOrder = useCallback((orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    logActivity('order', `Cancelled order #${orderId}`);
    createAuditLog('Delete', 'Sales', orderId, `Deleted sales order`);
  }, [logActivity, createAuditLog]);

  // ----------------------------------------------------
  // PRODUCTION BATCH ACTIONS (Legacy)
  // ----------------------------------------------------
  const launchBatch = useCallback((batchData) => {
    const batchNum = Math.floor(80 + batches.length + 1);
    const id = `BATCH-${batchNum}`;

    const newBatch = {
      id,
      productId: batchData.productId,
      productName: batchData.productName,
      line: batchData.line || 'Line Alpha (CNC Milling)',
      targetQty: Number(batchData.targetQty) || 100,
      unit: batchData.unit || 'pcs',
      progress: 0,
      status: 'In Progress',
      startedAt: new Date().toISOString().split('T')[0],
      targetDate: batchData.targetDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
    };

    setBatches(prev => [newBatch, ...prev]);
    logActivity('production', `Launched production batch #${id}: ${newBatch.productName}`);
    return newBatch;
  }, [batches.length, logActivity]);

  const updateBatchProgress = useCallback((batchId, progress) => {
    const clamped = Math.min(100, Math.max(0, progress));
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        const status = clamped >= 100 ? 'Completed' : clamped > 0 ? 'In Progress' : 'Queued';
        return { ...b, progress: clamped, status };
      }
      return b;
    }));
  }, []);

  const completeBatch = useCallback((batchId) => {
    const target = batches.find(b => b.id === batchId);
    if (!target) return;

    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        return { ...b, progress: 100, status: 'Completed' };
      }
      return b;
    }));

    if (target.productId) {
      addStockMovement({
        productId: target.productId,
        type: 'PRODUCTION_OUTPUT',
        quantity: Math.abs(Number(target.targetQty)),
        referenceType: 'Batch',
        referenceId: batchId
      });
    }

    logActivity('production', `Batch #${batchId} completed: Restocked ${target.productName}`);
  }, [batches, logActivity, addStockMovement]);

  const deleteBatch = useCallback((batchId) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
    logActivity('production', `Archived batch run #${batchId}`);
  }, [logActivity]);

  // ----------------------------------------------------
  // EVENT ENGINE (End-to-End ERP Flow)
  // ----------------------------------------------------
  
  const checkStock = useCallback((productId) => {
    const product = products.find(p => p.id === productId);
    return product ? Number(product.stock) : 0;
  }, [products]);

  const calculateMaterialRequirements = useCallback((productId, quantity) => {
    const bom = boms.find(b => b.productId === productId);
    if (!bom) return null; // No BoM means it's not manufactured
    
    return bom.components.map(comp => {
      const required = Number(comp.quantity) * Number(quantity);
      const available = checkStock(comp.productId);
      const shortage = Math.max(0, required - available);
      return {
        ...comp,
        required,
        available,
        shortage,
        status: shortage > 0 ? 'SHORTAGE' : 'AVAILABLE'
      };
    });
  }, [boms, checkStock]);

  const generateProcurementRecommendation = useCallback((materials, referenceId) => {
    materials.forEach(mat => {
      if (mat.shortage > 0) {
        const product = products.find(p => p.id === mat.productId);
        const suggestedQty = Math.max(mat.shortage, product ? (product.targetStock - product.stock) : mat.shortage);
        
        const newRec = {
          id: `PR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          materialId: mat.productId,
          materialName: mat.productName,
          required: mat.required,
          available: mat.available,
          shortage: mat.shortage,
          suggestedPurchase: suggestedQty,
          supplierId: product?.supplierId || null,
          status: 'Pending Approval',
          referenceId,
          date: new Date().toISOString()
        };
        setProcurementRecs(prev => [newRec, ...prev]);
        createAuditLog('Create', 'Procurement', newRec.id, `Generated procurement recommendation for ${mat.productName}`);
      }
    });
  }, [products, createAuditLog]);

  const createMTORequirement = useCallback((orderId, productId, shortageQty) => {
    const order = orders.find(o => o.id === orderId);
    const product = products.find(p => p.id === productId);
    const bom = boms.find(b => b.productId === productId);
    
    if (!product || !bom) return;

    const reqMaterials = calculateMaterialRequirements(productId, shortageQty);
    
    const hasShortage = reqMaterials.some(m => m.shortage > 0);
    
    if (hasShortage) {
      generateProcurementRecommendation(reqMaterials, orderId);
    }

    const newMO = {
      id: `MO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      salesOrderId: orderId,
      productId: productId,
      productName: product.name,
      quantity: shortageQty,
      bomId: bom.id,
      materials: reqMaterials,
      status: hasShortage ? 'Waiting for Materials' : 'Planned',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    
    setWorkOrders(prev => [newMO, ...prev]);
    updateOrderStatus(orderId, 'Processing (MTO)');
    logActivity('production', `MTO Work Order ${newMO.id} created for ${orderId}`);
    createAuditLog('Create', 'Manufacturing', newMO.id, `MTO Work Order created for Sales Order ${orderId}`);
    
    return newMO;
  }, [orders, products, boms, calculateMaterialRequirements, generateProcurementRecommendation, updateOrderStatus, logActivity, createAuditLog]);

  const fulfillSalesOrder = useCallback((orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Check if we have enough stock for all items
    let allAvailable = true;
    order.items.forEach(item => {
      const available = checkStock(item.productId);
      if (available < item.quantity) {
        allAvailable = false;
        createMTORequirement(orderId, item.productId, item.quantity - available);
      }
    });

    if (allAvailable) {
      updateOrderStatus(orderId, 'Ready for Delivery');
      
      // Consume the finished goods
      order.items.forEach(item => {
        addStockMovement({
          productId: item.productId,
          type: 'SALE_OUT',
          quantity: -Math.abs(Number(item.quantity)),
          referenceType: 'SalesOrder',
          referenceId: orderId
        });
      });
      
      logActivity('order', `Order ${orderId} is Ready for Delivery and stock deducted.`);
      createAuditLog('Fulfill', 'Sales', orderId, 'Stock deducted and ready for delivery');
    }
  }, [orders, checkStock, createMTORequirement, updateOrderStatus, addStockMovement, logActivity, createAuditLog]);

  const completeDelivery = useCallback((orderId) => {
    updateOrderStatus(orderId, 'Completed', 'Paid');
    logActivity('order', `Order ${orderId} has been successfully delivered.`);
    createAuditLog('Deliver', 'Sales', orderId, 'Order delivered to customer');
  }, [updateOrderStatus, logActivity, createAuditLog]);

  const startProduction = useCallback((moId) => {
    const mo = workOrders.find(w => w.id === moId);
    if (!mo) return;

    // Final check for materials
    const updatedMaterials = calculateMaterialRequirements(mo.productId, mo.quantity);
    const hasShortage = updatedMaterials.some(m => m.shortage > 0);
    
    if (hasShortage) {
      alert("Cannot start production. Materials are still missing.");
      return;
    }

    // Consume materials
    updatedMaterials.forEach(mat => {
      addStockMovement({
        productId: mat.productId,
        type: 'PRODUCTION_CONSUMPTION',
        quantity: -Math.abs(Number(mat.required)),
        referenceType: 'WorkOrder',
        referenceId: moId
      });
    });

    setWorkOrders(prev => prev.map(w => w.id === moId ? { ...w, status: 'In Progress', materials: updatedMaterials } : w));
    logActivity('production', `Started production for MO ${moId}`);
    createAuditLog('Start', 'Manufacturing', moId, 'Started production and consumed materials');
  }, [workOrders, calculateMaterialRequirements, addStockMovement, logActivity, createAuditLog]);

  const completeProduction = useCallback((moId) => {
    const mo = workOrders.find(w => w.id === moId);
    if (!mo) return;

    setWorkOrders(prev => prev.map(w => w.id === moId ? { ...w, status: 'Completed', progress: 100 } : w));
    
    // Add FG to inventory
    addStockMovement({
      productId: mo.productId,
      type: 'PRODUCTION_OUTPUT',
      quantity: Math.abs(Number(mo.quantity)),
      referenceType: 'WorkOrder',
      referenceId: moId
    });

    logActivity('production', `Completed production for MO ${moId}`);
    createAuditLog('Complete', 'Manufacturing', moId, 'Finished goods moved to inventory');

    // Fulfill linked sales order
    if (mo.salesOrderId) {
      // Re-trigger fulfillment check since stock is now available
      fulfillSalesOrder(mo.salesOrderId);
    }
  }, [workOrders, addStockMovement, logActivity, createAuditLog, fulfillSalesOrder]);

  const recordScrap = useCallback((moId, materialId, qty, reason) => {
    addStockMovement({
      productId: materialId,
      type: 'SCRAP_OUT',
      quantity: -Math.abs(Number(qty)),
      referenceType: 'WorkOrder',
      referenceId: moId
    });
    createAuditLog('Scrap', 'Manufacturing', moId, `Scrapped ${qty} of ${materialId}: ${reason}`);
  }, [addStockMovement, createAuditLog]);

  // ----------------------------------------------------
  // MANAGED USERS & RBAC PERMISSIONS ACTIONS
  // ----------------------------------------------------
  const addManagedUser = useCallback((userData) => {
    const id = `USR-${String(managedUsers.length + 1).padStart(3, '0')}`;
    const initials = userData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'US';
    const newUser = {
      ...userData,
      id,
      avatar: initials,
      role: userData.role || 'User',
      permissions: userData.permissions || null
    };
    setManagedUsers(prev => [newUser, ...prev]);
    logActivity('alert', `System Administrator created user account for ${newUser.name}`);
    return newUser;
  }, [managedUsers.length, logActivity]);

  const updateManagedUser = useCallback((id, updates) => {
    setManagedUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteManagedUser = useCallback((id) => {
    const target = managedUsers.find(u => u.id === id);
    setManagedUsers(prev => prev.filter(u => u.id !== id));
    if (target) {
      logActivity('alert', `Revoked system access and deleted user ${target.name}`);
    }
  }, [managedUsers, logActivity]);

  const updateUserPermissions = useCallback((userId, moduleKey, fieldName, permType, value) => {
    setManagedUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const currentPerms = u.permissions || {};
        const modulePerms = currentPerms[moduleKey] || {};
        const fieldPerms = modulePerms[fieldName] || { create: true, view: true, edit: true, delete: true };
        
        const updatedModule = {
          ...modulePerms,
          [fieldName]: {
            ...fieldPerms,
            [permType]: value
          }
        };

        return {
          ...u,
          permissions: {
            ...currentPerms,
            [moduleKey]: updatedModule
          }
        };
      }
      return u;
    }));
  }, []);

  const updateRoleMatrixItem = useCallback((index, field, value) => {
    setRoleMatrix(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  }, []);

  // ----------------------------------------------------
  // SETTINGS & SYSTEM ACTIONS
  // ----------------------------------------------------
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logActivity('alert', `System settings and organization preferences updated`);
  }, [logActivity]);

  const resetToDefaultData = useCallback(() => {
    storage.resetAll();
    setProducts(storage.getProducts());
    setSuppliers(storage.getSuppliers());
    setPurchaseOrders(storage.getPurchaseOrders());
    setBoms(storage.getBoms());
    setWorkOrders(storage.getWorkOrders());
    setStockMovements(storage.getStockMovements());
    setProcurementRecs(storage.getProcurementRecs());
    setAuditLogs(storage.getAuditLogs());
    
    setInventory(storage.getInventory());
    setCustomers(storage.getCustomers());
    setOrders(storage.getOrders());
    setBatches(storage.getBatches());
    setActivities(storage.getActivities());
    setSettings(storage.getSettings());
    setUser(storage.getUser());
    setManagedUsers(storage.getManagedUsers());
    setRoleMatrix(storage.getRoleMatrix());
    logActivity('alert', 'ERP system reset to demo dataset successfully');
  }, [logActivity]);

  const clearAllData = useCallback(() => {
    storage.clearAll();
    setProducts([]);
    setSuppliers([]);
    setPurchaseOrders([]);
    setBoms([]);
    setWorkOrders([]);
    setStockMovements([]);
    setProcurementRecs([]);
    setAuditLogs([]);
    
    setInventory([]);
    setCustomers([]);
    setOrders([]);
    setBatches([]);
    setActivities([{ id: `ACT-${Date.now()}`, type: 'alert', text: 'All ERP datasets cleared by Administrator', timestamp: new Date().toISOString() }]);
  }, []);

  // ----------------------------------------------------
  // COMPUTED METRICS & DERIVED DATA
  // ----------------------------------------------------
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
    const paidRevenue = orders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);

    const activeOrders = orders.filter(o => o.fulfillmentStatus !== 'Delivered');
    const lowStockItems = products.filter(i => i.stock <= i.minStock);
    const activeBatches = batches.filter(b => b.status !== 'Completed');
    const totalCatalogItems = products.length;

    const customerSpendMap = {};
    const customerOrderCountMap = {};
    orders.forEach(ord => {
      const cid = ord.customerId;
      if (cid) {
        customerSpendMap[cid] = (customerSpendMap[cid] || 0) + (Number(ord.totalAmount) || 0);
        customerOrderCountMap[cid] = (customerOrderCountMap[cid] || 0) + 1;
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap = {};
    monthNames.forEach(m => { monthMap[m] = { name: m, revenue: 0, profit: 0, orders: 0 }; });

    orders.forEach(ord => {
      if (ord.date) {
        const d = new Date(ord.date);
        const m = monthNames[d.getMonth()] || "Aug";
        const amt = Number(ord.totalAmount) || 0;
        monthMap[m].revenue += amt;
        monthMap[m].profit += Math.round(amt * 0.45);
        monthMap[m].orders += 1;
      }
    });

    const baseline = [
      { name: "Mar", revenue: 42000, profit: 18900 },
      { name: "Apr", revenue: 58000, profit: 26100 },
      { name: "May", revenue: 89000, profit: 40050 },
      { name: "Jun", revenue: 112000, profit: 50400 },
      { name: "Jul", revenue: 145000, profit: 65250 },
      { name: "Aug", revenue: Math.max(160000, totalRevenue), profit: Math.round(Math.max(160000, totalRevenue) * 0.45) },
    ];

    const catMap = {};
    products.forEach(item => {
      const cat = item.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + item.stock;
    });

    const categoryChartData = Object.keys(catMap).map((cat, idx) => {
      const colors = ['#2d5a45', '#2563eb', '#7c3aed', '#d97706', '#059669', '#e11d48'];
      return {
        name: cat,
        units: catMap[cat],
        fill: colors[idx % colors.length]
      };
    });

    const alerts = [];
    lowStockItems.forEach(item => {
      alerts.push({
        id: `low-${item.id}`,
        title: `Low Stock: ${item.name}`,
        desc: `Only ${item.stock} ${item.unit} remaining (Min: ${item.minStock})`,
        type: 'warning'
      });
    });
    activeOrders.filter(o => o.fulfillmentStatus === 'Ready for Dispatch').forEach(ord => {
      alerts.push({
        id: `disp-${ord.id}`,
        title: `Order Ready for Dispatch`,
        desc: `#${ord.id} for ${ord.customerName}`,
        type: 'info'
      });
    });

    return {
      totalRevenue,
      paidRevenue,
      activeOrdersCount: activeOrders.length,
      lowStockCount: lowStockItems.length,
      activeBatchesCount: activeBatches.length,
      totalCatalogItems,
      customerSpendMap,
      customerOrderCountMap,
      monthlyChartData: baseline,
      categoryChartData: categoryChartData.length > 0 ? categoryChartData : [
        { name: "Raw Material", units: 492, fill: "#2d5a45" },
        { name: "Components", units: 1282, fill: "#2563eb" },
        { name: "Finished Goods", units: 335, fill: "#7c3aed" },
      ],
      alerts
    };
  }, [orders, products, batches]);

  const value = {
    // Authentication
    authUser,
    token,
    isAuthenticated: Boolean(token && authUser),
    isAdmin: Boolean(authUser && ((authUser.role || '').toUpperCase() === 'ADMIN' || (authUser.role || '').toUpperCase() === 'SYSTEM ADMINISTRATOR')),
    isAuthLoading,
    loginUser,
    signupUser,
    logoutUser,

    // Data
    products,
    suppliers,
    purchaseOrders,
    boms,
    workOrders,
    stockMovements,
    procurementRecs,
    auditLogs,
    inventory,
    customers,
    orders,
    batches,
    activities,
    settings,
    user: authUser || user,
    managedUsers,
    roleMatrix,
    metrics,
    formatCurrency,
    
    // Core ERP functions
    createAuditLog,
    addStockMovement,
    
    // Event Engine Functions
    checkStock,
    calculateMaterialRequirements,
    generateProcurementRecommendation,
    createMTORequirement,
    fulfillSalesOrder,
    completeDelivery,
    startProduction,
    completeProduction,
    recordScrap,

    // Products & Inventory
    addProduct,
    updateProduct,
    deleteProduct,
    addInventoryItem,
    updateInventoryItem,
    adjustStock,
    deleteInventoryItem,
    
    // Suppliers
    addSupplier,
    updateSupplier,
    deleteSupplier,
    // Purchase Orders
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    receivePurchaseOrder,
    // Customers
    addCustomer,
    updateCustomer,
    deleteCustomer,
    // Sales
    createSalesOrder,
    updateOrderStatus,
    deleteSalesOrder,
    // Production
    launchBatch,
    updateBatchProgress,
    completeBatch,
    deleteBatch,
    // Users & Permissions (RBAC)
    employees,
    setEmployees,
    hasPermission,
    addManagedUser,
    updateManagedUser,
    deleteManagedUser,
    updateUserPermissions,
    updateRoleMatrixItem,
    // System
    updateSettings,
    setUser,
    resetToDefaultData,
    clearAllData,
  };

  return (
    <ErpContext.Provider value={value}>
      {children}
    </ErpContext.Provider>
  );
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}
