import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  authApi,
  productsApi,
  salesApi,
  purchaseApi,
  manufacturingApi,
  bomApi,
  inventoryApi,
  dashboardApi,
  auditApi,
  masterApi,
  usersApi
} from '../lib/api';

const ErpContext = createContext(null);

export function ErpProvider({ children }) {
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
  // BACKEND ERP DATA STATE
  // ----------------------------------------------------
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [boms, setBoms] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [settings, setSettings] = useState({
    orgName: 'Shiv Furniture Works',
    orgEmail: 'contact@shivfurniture.in',
    orgPhone: '+91 22 1234 5678',
    currency: 'INR',
    currencySymbol: '₹',
    taxRate: 18,
    lowStockThresholdPercent: 20
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchTimeRef = useRef(0);
  const inFlightPromiseRef = useRef(null);

  // ----------------------------------------------------
  // PERMISSION MATCHER
  // ----------------------------------------------------
  const hasPermission = useCallback((permission) => {
    if (!authUser) return false;
    const perms = authUser.permissions || [];
    if (perms.includes('*') || perms.includes('all')) return true;
    if (perms.includes(permission)) return true;

    const [domain] = permission.split('.');
    if (domain && (perms.includes(`${domain}.*`) || perms.includes(`${domain}.all`))) {
      return true;
    }

    // Role-name fallback for convenience
    const role = (authUser.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'SYSTEM ADMINISTRATOR' || role === 'BUSINESS OWNER') return true;

    return false;
  }, [authUser]);

  // ----------------------------------------------------
  // REFRESH ALL ERP DATA FROM BACKEND (PERMISSION-AWARE + DEDUPLICATED)
  // ----------------------------------------------------
  const refreshData = useCallback(async (force = false) => {
    if (!authUser && !token) return;

    const now = Date.now();
    // Throttle duplicate background fetches within 3 seconds unless explicitly forced
    if (!force && (now - lastFetchTimeRef.current < 3000)) {
      return;
    }

    // If an identical fetch is already in-flight, reuse it
    if (inFlightPromiseRef.current) {
      return inFlightPromiseRef.current;
    }

    lastFetchTimeRef.current = now;
    setIsLoading(true);

    const executeFetch = async () => {
      try {
        const promises = [];
        const keys = [];

        // Always fetch products if permitted
        if (hasPermission('product.view')) {
          keys.push('products');
          promises.push(productsApi.getAll());
        }

      if (hasPermission('sales.view')) {
        keys.push('sales');
        promises.push(salesApi.getAll());
      }

      if (hasPermission('purchase.view')) {
        keys.push('purchase');
        promises.push(purchaseApi.getAll());
      }

      if (hasPermission('manufacturing.view')) {
        keys.push('manufacturing');
        promises.push(manufacturingApi.getAll());
      }

      if (hasPermission('bom.view')) {
        keys.push('bom');
        promises.push(bomApi.getAll());
      }

      if (hasPermission('inventory.view')) {
        keys.push('movements');
        promises.push(inventoryApi.getMovements());
      }

      if (hasPermission('customer.view')) {
        keys.push('customers');
        promises.push(masterApi.getCustomers());
      }

      if (hasPermission('vendor.view')) {
        keys.push('vendors');
        promises.push(masterApi.getVendors());
      }

      if (hasPermission('audit.view') || hasPermission('*')) {
        keys.push('audit');
        promises.push(auditApi.getLogs());
      }

      // Dashboard metrics (accessible to all logged-in operational staff)
      keys.push('dashboard');
      promises.push(dashboardApi.getMetrics());

      if (hasPermission('user.view') || hasPermission('*')) {
        keys.push('users');
        promises.push(usersApi.getAll());
      }

      const results = await Promise.allSettled(promises);

      results.forEach((res, idx) => {
        if (res.status !== 'fulfilled' || !res.value?.data) return;
        const data = res.value.data;
        const key = keys[idx];

        if (key === 'products') setProducts(data);
        else if (key === 'sales') setOrders(data);
        else if (key === 'purchase') setPurchaseOrders(data);
        else if (key === 'manufacturing') setWorkOrders(data);
        else if (key === 'bom') setBoms(data);
        else if (key === 'movements') setStockMovements(data);
        else if (key === 'customers') {
          setCustomers(data.map(c => ({ ...c, id: c._id, city: `${c.address?.city || ''}, ${c.address?.state || ''}`.trim() })));
        } else if (key === 'vendors') {
          setSuppliers(data.map(v => ({ ...v, id: v._id, contactPerson: v.name, address: `${v.address?.street || ''}, ${v.address?.city || ''}`.trim() })));
        } else if (key === 'audit') {
          setAuditLogs(data);
          const acts = data.slice(0, 20).map(a => ({
            id: a.id || a._id,
            type: a.module === 'Sales' ? 'order' : a.module === 'Manufacturing' ? 'production' : a.module === 'Inventory' ? 'stock' : 'alert',
            text: a.description,
            timestamp: a.timestamp
          }));
          setActivities(acts);
        } else if (key === 'dashboard') {
          setDashboardMetrics(data);
        } else if (key === 'users') {
          setEmployees(data.map(u => ({ ...u, id: u._id, employeeName: u.name, status: u.status })));
        }
      });

      setError(null);
      } catch (err) {
        console.error('Error refreshing ERP data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        inFlightPromiseRef.current = null;
      }
    };

    inFlightPromiseRef.current = executeFetch();
    return inFlightPromiseRef.current;
  }, [authUser, token, hasPermission]);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authApi.getMe();
        if (res?.data) {
          setAuthUser(res.data);
          localStorage.setItem('mini_erp_auth_user', JSON.stringify(res.data));
        }
      } catch (err) {
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
          setAuthUser(null);
        }
      } finally {
        setIsAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // Sync data when auth user is ready
  useEffect(() => {
    if (authUser) {
      refreshData();
    }
  }, [authUser, refreshData]);

  // ----------------------------------------------------
  // AUTH ACTIONS
  // ----------------------------------------------------
  const loginUser = useCallback(async (employeeId, password, asAdmin = false) => {
    const res = await authApi.login(employeeId, password);
    if (!res?.data) {
      throw new Error('Login failed: Invalid server response');
    }

    const userData = res.data;
    const roleName = (userData.role || '').toUpperCase();
    const isAdmin = roleName === 'ADMIN' || roleName === 'SYSTEM ADMINISTRATOR' || roleName === 'BUSINESS OWNER';

    if (asAdmin && !isAdmin) {
      throw new Error('Access denied. Administrator privileges required to access Admin portal.');
    }

    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    localStorage.setItem('mini_erp_auth_user', JSON.stringify(userData));
    setToken(userData.token || 'authenticated');
    setAuthUser(userData);

    return userData;
  }, []);

  const signupUser = useCallback(async ({ name, employeeId, email, password }) => {
    const res = await authApi.register({ name, employeeId, email, password });
    if (!res?.data) {
      throw new Error('Registration failed');
    }

    const userData = res.data;
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    localStorage.setItem('mini_erp_auth_user', JSON.stringify(userData));
    setToken(userData.token || 'authenticated');
    setAuthUser(userData);

    return userData;
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('mini_erp_auth_user');
    setToken(null);
    setAuthUser(null);
  }, []);

  // ----------------------------------------------------
  // PRODUCTS & INVENTORY ACTIONS
  // ----------------------------------------------------
  const addProduct = useCallback(async (productData) => {
    const res = await productsApi.create(productData);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const updateProduct = useCallback(async (id, updates) => {
    const res = await productsApi.update(id, updates);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const deleteProduct = useCallback(async (id) => {
    const res = await productsApi.delete(id);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const adjustStock = useCallback(async (productId, delta) => {
    const res = await inventoryApi.adjustStock({ productId, delta });
    await refreshData();
    return res;
  }, [refreshData]);

  // Legacy mappings
  const addInventoryItem = addProduct;
  const updateInventoryItem = updateProduct;
  const deleteInventoryItem = deleteProduct;
  const inventory = products;

  // ----------------------------------------------------
  // SALES ORDER ACTIONS
  // ----------------------------------------------------
  const createSalesOrder = useCallback(async (orderData) => {
    const res = await salesApi.create(orderData);
    // Auto-confirm order if status is to be confirmed
    const createdId = res.data?._id || res.data?.id;
    if (createdId) {
      try {
        await salesApi.confirm(createdId);
      } catch (err) {
        console.warn('Auto-confirm warning:', err.message);
      }
    }
    await refreshData();
    return res.data;
  }, [refreshData]);

  const confirmSalesOrder = useCallback(async (orderId) => {
    const res = await salesApi.confirm(orderId);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const fulfillSalesOrder = useCallback(async (orderId) => {
    const res = await salesApi.deliver(orderId);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const completeDelivery = fulfillSalesOrder;

  const deleteSalesOrder = useCallback(async (orderId) => {
    const res = await salesApi.cancel(orderId);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const updateOrderStatus = useCallback(async (orderId, fulfillmentStatus) => {
    if (fulfillmentStatus === 'Ready for Delivery' || fulfillmentStatus === 'Completed') {
      return fulfillSalesOrder(orderId);
    }
    await refreshData();
  }, [fulfillSalesOrder, refreshData]);

  // ----------------------------------------------------
  // PURCHASE ORDER ACTIONS
  // ----------------------------------------------------
  const createPurchaseOrder = useCallback(async (poData) => {
    const res = await purchaseApi.create(poData);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const confirmPurchaseOrder = useCallback(async (orderId) => {
    const res = await purchaseApi.confirm(orderId);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const receivePurchaseOrder = useCallback(async (orderId) => {
    const res = await purchaseApi.receive(orderId);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const updatePurchaseOrderStatus = useCallback(async (orderId, status) => {
    if (status === 'Received') {
      return receivePurchaseOrder(orderId);
    } else {
      const res = await purchaseApi.confirm(orderId);
      await refreshData();
      return res.data;
    }
  }, [receivePurchaseOrder, refreshData]);

  // ----------------------------------------------------
  // MANUFACTURING & PRODUCTION BATCH ACTIONS
  // ----------------------------------------------------
  const launchBatch = useCallback(async (batchData) => {
    const res = await manufacturingApi.create({
      productId: batchData.productId,
      quantityToProduce: batchData.targetQty,
      line: batchData.line,
      targetDate: batchData.targetDate
    });
    await refreshData();
    return res.data;
  }, [refreshData]);

  const updateBatchProgress = useCallback(async (batchId, progress) => {
    const res = await manufacturingApi.updateProgress(batchId, { progress });
    await refreshData();
    return res.data;
  }, [refreshData]);

  const completeBatch = useCallback(async (batchId) => {
    const res = await manufacturingApi.complete(batchId);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const deleteBatch = useCallback(async (batchId) => {
    const res = await manufacturingApi.delete(batchId);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const batches = workOrders;

  // ----------------------------------------------------
  // SUPPLIER & CUSTOMER ACTIONS
  // ----------------------------------------------------
  const addSupplier = useCallback(async (supplierData) => {
    const res = await masterApi.createVendor({
      name: supplierData.name,
      email: supplierData.email || 'vendor@example.com',
      phone: supplierData.phone,
      address: { street: supplierData.address || '', city: 'Mumbai', state: 'MH', country: 'India' }
    });
    await refreshData();
    return res.data;
  }, [refreshData]);

  const updateSupplier = useCallback(async (id, updates) => {
    const res = await masterApi.updateVendor(id, updates);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const deleteSupplier = useCallback(async (id) => {
    const res = await masterApi.deleteVendor(id);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const addCustomer = useCallback(async (custData) => {
    const res = await masterApi.createCustomer({
      name: custData.name,
      email: custData.email || 'customer@example.com',
      phone: custData.phone,
      address: { street: custData.address || custData.city || '', city: custData.city || 'Mumbai', state: 'MH', country: 'India' }
    });
    await refreshData();
    return res.data;
  }, [refreshData]);

  const updateCustomer = useCallback(async (id, updates) => {
    const res = await masterApi.updateCustomer(id, updates);
    await refreshData();
    return res.data;
  }, [refreshData]);

  const deleteCustomer = useCallback(async (id) => {
    const res = await masterApi.deleteCustomer(id);
    await refreshData();
    return res.data;
  }, [refreshData]);

  // Format currency helper
  const formatCurrency = useCallback((amount) => {
    const sym = settings?.currencySymbol || '₹';
    const num = Number(amount) || 0;
    return `${sym}${num.toLocaleString('en-IN')}`;
  }, [settings?.currencySymbol]);

  // Value object
  const value = useMemo(() => {
    const roleUpper = (authUser?.role || '').toUpperCase();
    const isUserAdmin = roleUpper === 'ADMIN' || roleUpper === 'SYSTEM ADMINISTRATOR' || roleUpper === 'BUSINESS OWNER' || (authUser?.permissions || []).includes('*');

    return {
      // Auth & Permissions
      authUser,
      user: authUser,
      isAuthenticated: Boolean(authUser),
      isAdmin: isUserAdmin,
      token,
      isAuthLoading,
      hasPermission,
      loginUser,
      signupUser,
      logoutUser,

    // Data State
    products,
    inventory,
    suppliers,
    customers,
    orders,
    purchaseOrders,
    workOrders,
    batches,
    boms,
    stockMovements,
    auditLogs,
    activities,
    employees,
    settings,
    metrics: dashboardMetrics?.kpis || {},
    dashboardMetrics,

    // Status
    isLoading,
    error,
    refreshData,

    // Action Handlers
    addProduct,
    updateProduct,
    deleteProduct,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,

    createSalesOrder,
    confirmSalesOrder,
    fulfillSalesOrder,
    completeDelivery,
    deleteSalesOrder,
    updateOrderStatus,

    createPurchaseOrder,
    confirmPurchaseOrder,
    receivePurchaseOrder,
    updatePurchaseOrderStatus,

    launchBatch,
    updateBatchProgress,
    completeBatch,
    deleteBatch,

    addSupplier,
    updateSupplier,
    deleteSupplier,

    addCustomer,
    updateCustomer,
    deleteCustomer,

    formatCurrency
  };
}, [
    authUser,
    token,
    isAuthLoading,
    hasPermission,
    loginUser,
    signupUser,
    logoutUser,
    products,
    inventory,
    suppliers,
    customers,
    orders,
    purchaseOrders,
    workOrders,
    batches,
    boms,
    stockMovements,
    auditLogs,
    activities,
    employees,
    settings,
    dashboardMetrics,
    isLoading,
    error,
    refreshData,
    addProduct,
    updateProduct,
    deleteProduct,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    createSalesOrder,
    confirmSalesOrder,
    fulfillSalesOrder,
    completeDelivery,
    deleteSalesOrder,
    updateOrderStatus,
    createPurchaseOrder,
    confirmPurchaseOrder,
    receivePurchaseOrder,
    updatePurchaseOrderStatus,
    launchBatch,
    updateBatchProgress,
    completeBatch,
    deleteBatch,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    formatCurrency
  ]);

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}
