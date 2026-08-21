import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storage, DEFAULT_SETTINGS, DEFAULT_USER, DEFAULT_MANAGED_USERS, DEFAULT_ROLE_MATRIX } from '../services/erpStorage';

const ErpContext = createContext(null);

export function ErpProvider({ children }) {
  const [inventory, setInventory] = useState(() => storage.getInventory() || []);
  const [customers, setCustomers] = useState(() => storage.getCustomers() || []);
  const [orders, setOrders] = useState(() => storage.getOrders() || []);
  const [batches, setBatches] = useState(() => storage.getBatches() || []);
  const [activities, setActivities] = useState(() => storage.getActivities() || []);
  const [settings, setSettings] = useState(() => storage.getSettings() || {});
  const [user, setUser] = useState(() => storage.getUser() || {});
  const [managedUsers, setManagedUsers] = useState(() => storage.getManagedUsers() || DEFAULT_MANAGED_USERS);
  const [roleMatrix, setRoleMatrix] = useState(() => storage.getRoleMatrix() || DEFAULT_ROLE_MATRIX);

  // Save to storage on state change
  useEffect(() => { storage.setInventory(inventory); }, [inventory]);
  useEffect(() => { storage.setCustomers(customers); }, [customers]);
  useEffect(() => { storage.setOrders(orders); }, [orders]);
  useEffect(() => { storage.setBatches(batches); }, [batches]);
  useEffect(() => { storage.setActivities(activities); }, [activities]);
  useEffect(() => { storage.setSettings(settings); }, [settings]);
  useEffect(() => { storage.setUser(user); }, [user]);
  useEffect(() => { storage.setManagedUsers(managedUsers); }, [managedUsers]);
  useEffect(() => { storage.setRoleMatrix(roleMatrix); }, [roleMatrix]);

  // Helper to log activities
  const logActivity = useCallback((type, text) => {
    const newAct = {
      id: `ACT-${Date.now()}`,
      type,
      text,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev.slice(0, 49)]); // keep latest 50
  }, []);

  // Format currency according to settings
  const formatCurrency = useCallback((amount) => {
    const sym = settings?.currencySymbol || '₹';
    const num = Number(amount) || 0;
    return `${sym}${num.toLocaleString('en-IN')}`;
  }, [settings?.currencySymbol]);

  // ----------------------------------------------------
  // INVENTORY ACTIONS
  // ----------------------------------------------------
  const addInventoryItem = useCallback((item) => {
    const id = `INV-${String(inventory.length + 1).padStart(3, '0')}`;
    const newItem = {
      ...item,
      id,
      sku: item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: Number(item.stock) || 0,
      minStock: Number(item.minStock) || 10,
      unitPrice: Number(item.unitPrice) || 100,
      status: (Number(item.stock) || 0) <= (Number(item.minStock) || 10) ? 'Low Stock' : 'In Stock'
    };
    setInventory(prev => [newItem, ...prev]);
    logActivity('stock', `Added new product to inventory: ${newItem.name} (${newItem.sku})`);
    return newItem;
  }, [inventory.length, logActivity]);

  const updateInventoryItem = useCallback((id, updates) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updates };
        merged.stock = Number(merged.stock) || 0;
        merged.minStock = Number(merged.minStock) || 0;
        merged.unitPrice = Number(merged.unitPrice) || 0;
        merged.status = merged.stock <= merged.minStock ? 'Low Stock' : 'In Stock';
        return merged;
      }
      return item;
    }));
    logActivity('stock', `Updated inventory item ${id}`);
  }, [logActivity]);

  const adjustStock = useCallback((id, delta) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + delta);
        const status = newStock <= item.minStock ? 'Low Stock' : 'In Stock';
        return { ...item, stock: newStock, status };
      }
      return item;
    }));
    const target = inventory.find(i => i.id === id);
    if (target) {
      logActivity('stock', `Stock adjusted for ${target.name}: ${delta > 0 ? `+${delta}` : delta} ${target.unit}`);
    }
  }, [inventory, logActivity]);

  const deleteInventoryItem = useCallback((id) => {
    const target = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(i => i.id !== id));
    if (target) {
      logActivity('stock', `Deleted inventory item: ${target.name} (${target.sku})`);
    }
  }, [inventory, logActivity]);

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
    return newCust;
  }, [customers.length, logActivity]);

  const updateCustomer = useCallback((id, updates) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logActivity('customer', `Updated client record for ${updates.name || id}`);
  }, [logActivity]);

  const deleteCustomer = useCallback((id) => {
    const target = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    if (target) {
      logActivity('customer', `Removed client: ${target.name}`);
    }
  }, [customers, logActivity]);

  // ----------------------------------------------------
  // SALES ORDER ACTIONS
  // ----------------------------------------------------
  const createSalesOrder = useCallback((orderData) => {
    const year = new Date().getFullYear();
    const seq = Math.floor(1000 + Math.random() * 9000);
    const id = `SO-${year}-${seq}`;

    // Calculate total amount
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

    // Deduct stock for inventory items included in order
    setInventory(prev => prev.map(invItem => {
      const orderItem = items.find(it => it.productId === invItem.id);
      if (orderItem) {
        const newStock = Math.max(0, invItem.stock - Number(orderItem.quantity));
        return {
          ...invItem,
          stock: newStock,
          status: newStock <= invItem.minStock ? 'Low Stock' : 'In Stock'
        };
      }
      return invItem;
    }));

    setOrders(prev => [newOrder, ...prev]);
    logActivity('order', `New Sales Order created: #${id} for ${newOrder.customerName} (${formatCurrency(totalAmount)})`);
    return newOrder;
  }, [formatCurrency, logActivity]);

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
  }, [logActivity]);

  const deleteSalesOrder = useCallback((orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    logActivity('order', `Cancelled order #${orderId}`);
  }, [logActivity]);

  // ----------------------------------------------------
  // PRODUCTION BATCH ACTIONS
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
    logActivity('production', `Launched production batch #${id}: ${newBatch.productName} (${newBatch.targetQty} ${newBatch.unit}) on ${newBatch.line}`);
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

    // Increment inventory product stock if matching
    if (target.productId) {
      setInventory(prev => prev.map(invItem => {
        if (invItem.id === target.productId) {
          const newStock = invItem.stock + Number(target.targetQty);
          return {
            ...invItem,
            stock: newStock,
            status: newStock <= invItem.minStock ? 'Low Stock' : 'In Stock'
          };
        }
        return invItem;
      }));
    }

    logActivity('production', `Batch #${batchId} completed: Restocked ${target.targetQty} ${target.unit} of ${target.productName}`);
  }, [batches, logActivity]);

  const deleteBatch = useCallback((batchId) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
    logActivity('production', `Archived batch run #${batchId}`);
  }, [logActivity]);

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
    logActivity('alert', `System Administrator created user account for ${newUser.name} (${newUser.position || newUser.role})`);
    return newUser;
  }, [managedUsers.length, logActivity]);

  const updateManagedUser = useCallback((id, updates) => {
    setManagedUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    logActivity('alert', `Updated user credentials for ${updates.name || id}`);
  }, [logActivity]);

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
    const lowStockItems = inventory.filter(i => i.stock <= i.minStock);
    const activeBatches = batches.filter(b => b.status !== 'Completed');
    const totalCatalogItems = inventory.length;

    // Customer spend map
    const customerSpendMap = {};
    const customerOrderCountMap = {};
    orders.forEach(ord => {
      const cid = ord.customerId;
      if (cid) {
        customerSpendMap[cid] = (customerSpendMap[cid] || 0) + (Number(ord.totalAmount) || 0);
        customerOrderCountMap[cid] = (customerOrderCountMap[cid] || 0) + 1;
      }
    });

    // Dynamic monthly chart data
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
    inventory.forEach(item => {
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
  }, [orders, inventory, batches]);

  const value = {
    inventory,
    customers,
    orders,
    batches,
    activities,
    settings,
    user,
    managedUsers,
    roleMatrix,
    metrics,
    formatCurrency,
    // Inventory
    addInventoryItem,
    updateInventoryItem,
    adjustStock,
    deleteInventoryItem,
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
