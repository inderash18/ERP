const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';

export const apiCall = async (endpoint, options = {}) => {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}/api/v1${formattedEndpoint}`;

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error?.message || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.code = data.error?.code;
    err.status = response.status;
    throw err;
  }

  return data;
};

// Modular API Client Methods
export const authApi = {
  login: (loginId, password) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ loginId, password }) }),
  register: (userData) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  getMe: () => apiCall('/auth/me')
};

export const productsApi = {
  getAll: () => apiCall('/products'),
  getById: (id) => apiCall(`/products/${id}`),
  create: (data) => apiCall('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/products/${id}`, { method: 'DELETE' })
};

export const salesApi = {
  getAll: () => apiCall('/sales-orders'),
  getById: (id) => apiCall(`/sales-orders/${id}`),
  create: (data) => apiCall('/sales-orders', { method: 'POST', body: JSON.stringify(data) }),
  confirm: (id) => apiCall(`/sales-orders/${id}/confirm`, { method: 'POST' }),
  deliver: (id) => apiCall(`/sales-orders/${id}/deliver`, { method: 'POST' }),
  cancel: (id) => apiCall(`/sales-orders/${id}/cancel`, { method: 'POST' })
};

export const purchaseApi = {
  getAll: () => apiCall('/purchase-orders'),
  getById: (id) => apiCall(`/purchase-orders/${id}`),
  create: (data) => apiCall('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  confirm: (id) => apiCall(`/purchase-orders/${id}/confirm`, { method: 'POST' }),
  receive: (id, itemsToReceive) => apiCall(`/purchase-orders/${id}/receive`, { method: 'POST', body: JSON.stringify({ itemsToReceive }) })
};

export const manufacturingApi = {
  getAll: () => apiCall('/manufacturing-orders'),
  getById: (id) => apiCall(`/manufacturing-orders/${id}`),
  create: (data) => apiCall('/manufacturing-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateProgress: (id, data) => apiCall(`/manufacturing-orders/${id}/progress`, { method: 'POST', body: JSON.stringify(data) }),
  complete: (id) => apiCall(`/manufacturing-orders/${id}/complete`, { method: 'POST' }),
  delete: (id) => apiCall(`/manufacturing-orders/${id}`, { method: 'DELETE' })
};

export const bomApi = {
  getAll: () => apiCall('/boms'),
  getById: (id) => apiCall(`/boms/${id}`),
  create: (data) => apiCall('/boms', { method: 'POST', body: JSON.stringify(data) }),
  calculateRequirements: (productId, quantity) => apiCall('/boms/calculate-requirements', { method: 'POST', body: JSON.stringify({ productId, quantity }) })
};

export const inventoryApi = {
  getBalances: () => apiCall('/inventory'),
  getMovements: () => apiCall('/inventory/movements'),
  getAvailability: (productId) => apiCall(`/inventory/${productId}/availability`),
  getLedger: (productId) => apiCall(`/inventory/${productId}/ledger`),
  adjustStock: (data) => apiCall('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) })
};

export const procurementApi = {
  evaluate: (data) => apiCall('/procurement/evaluate', { method: 'POST', body: JSON.stringify(data) })
};

export const dashboardApi = {
  getMetrics: () => apiCall('/dashboard')
};

export const auditApi = {
  getLogs: (filter = {}) => {
    const params = new URLSearchParams(filter).toString();
    return apiCall(`/audit-logs${params ? `?${params}` : ''}`);
  }
};

export const usersApi = {
  getAll: () => apiCall('/users'),
  create: (data) => apiCall('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

export const masterApi = {
  getCategories: () => apiCall('/master/categories'),
  createCategory: (data) => apiCall('/master/categories', { method: 'POST', body: JSON.stringify(data) }),
  getCustomers: () => apiCall('/master/customers'),
  createCustomer: (data) => apiCall('/master/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => apiCall(`/master/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => apiCall(`/master/customers/${id}`, { method: 'DELETE' }),
  getVendors: () => apiCall('/master/vendors'),
  createVendor: (data) => apiCall('/master/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateVendor: (id, data) => apiCall(`/master/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVendor: (id) => apiCall(`/master/vendors/${id}`, { method: 'DELETE' }),
  getWorkCenters: () => apiCall('/master/workcenters'),
  createWorkCenter: (data) => apiCall('/master/workcenters', { method: 'POST', body: JSON.stringify(data) })
};

export { BASE_URL };
