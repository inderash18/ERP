import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import ManufacturingOrder from '../models/ManufacturingOrder.js';
import InventoryBalance from '../models/InventoryBalance.js';
import StockLedger from '../models/StockLedger.js';
import Product from '../models/Product.js';
import AuditLog from '../models/AuditLog.js';

// Short-lived metric cache (5s TTL) to prevent repeated heavy aggregations on frequent polling
const metricsCache = new Map();
const CACHE_TTL_MS = 5000;

export const DashboardService = {
  invalidateCache(organizationId) {
    if (organizationId) metricsCache.delete(organizationId.toString());
    else metricsCache.clear();
  },

  async getMetrics(organizationId) {
    const orgKey = organizationId ? organizationId.toString() : 'default';
    const cached = metricsCache.get(orgKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    const [
      salesOrders,
      purchaseOrders,
      manufacturingOrders,
      products,
      inventoryBalances,
      recentMovements,
      recentAuditLogs
    ] = await Promise.all([
      SalesOrder.find({ organizationId }).lean(),
      PurchaseOrder.find({ organizationId }).lean(),
      ManufacturingOrder.find({ organizationId }).populate('product').lean(),
      Product.find({ organizationId, isActive: true }).lean(),
      InventoryBalance.find({ organizationId }).populate('product').lean(),
      StockLedger.find({ organizationId }).sort({ createdAt: -1 }).limit(10).populate('product userId').lean(),
      AuditLog.find({ organizationId }).sort({ timestamp: -1 }).limit(10).lean()
    ]);

    // Compute Sales Metrics
    const totalSalesOrders = salesOrders.length;
    const totalRevenue = salesOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingDeliveries = salesOrders.filter(o => ['CONFIRMED', 'PROCESSING', 'PROCESSING_MTO'].includes(o.status)).length;
    const deliveredOrders = salesOrders.filter(o => o.status === 'DELIVERED').length;

    // Compute Purchase Metrics
    const totalPurchaseOrders = purchaseOrders.length;
    const totalSpend = purchaseOrders.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const pendingReceipts = purchaseOrders.filter(p => ['DRAFT', 'SENT', 'PARTIALLY_RECEIVED'].includes(p.status)).length;

    // Compute Manufacturing Metrics
    const activeManufacturing = manufacturingOrders.filter(m => ['PLANNED', 'IN_PROGRESS'].includes(m.status)).length;
    const completedManufacturing = manufacturingOrders.filter(m => m.status === 'COMPLETED').length;

    // Build Balance Map
    const balanceMap = new Map();
    for (const bal of inventoryBalances) {
      if (bal.product?._id) {
        balanceMap.set(bal.product._id.toString(), bal);
      }
    }

    // Compute Inventory Metrics across all active products
    let totalStockOnHand = 0;
    let totalStockReserved = 0;
    let inventoryValue = 0;
    const lowStockAlerts = [];

    for (const prod of products) {
      const bal = balanceMap.get(prod._id.toString());
      const onHand = bal ? (bal.onHand || 0) : 0;
      const reserved = bal ? (bal.reserved || 0) : 0;
      const cost = prod.costPrice || 0;
      const reorderLevel = prod.reorderLevel !== undefined ? prod.reorderLevel : (prod.minStock || 10);

      totalStockOnHand += onHand;
      totalStockReserved += reserved;
      inventoryValue += onHand * cost;

      if (onHand <= reorderLevel) {
        lowStockAlerts.push({
          productId: prod._id,
          productName: prod.name,
          sku: prod.sku,
          onHand,
          reorderLevel,
          unit: prod.unit || 'pcs'
        });
      }
    }

    const result = {
      kpis: {
        totalRevenue,
        totalSalesOrders,
        pendingDeliveries,
        deliveredOrders,
        totalPurchaseOrders,
        pendingReceipts,
        activeManufacturing,
        completedManufacturing,
        totalStockOnHand,
        totalStockReserved,
        inventoryValue,
        lowStockCount: lowStockAlerts.length
      },
      lowStockAlerts,
      recentMovements,
      recentAuditLogs
    };

    metricsCache.set(orgKey, { data: result, timestamp: Date.now() });
    return result;
  }
};
