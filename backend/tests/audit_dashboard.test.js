import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import AuditLog from '../src/models/AuditLog.js';
import Product from '../src/models/Product.js';
import { DashboardService } from '../src/services/dashboard.service.js';
import { AuditService } from '../src/services/audit.service.js';

describe('Audit Logging & Dashboard Telemetry Tests', () => {
  let tenant1, tenant2;

  before(async () => {
    await connectDB();
    tenant1 = await createTestTenant('Audit Tenant 1');
    tenant2 = await createTestTenant('Audit Tenant 2');

    // Create Audit Logs for Tenant 1
    await AuditService.log({
      organizationId: tenant1.org._id,
      action: 'PRODUCT_CREATED',
      module: 'Inventory',
      referenceType: 'Product',
      referenceId: 'PRD-001',
      user: tenant1.adminUser,
      description: 'Created new product for Tenant 1'
    });

    // Create Audit Log for Tenant 2
    await AuditService.log({
      organizationId: tenant2.org._id,
      action: 'LOGIN',
      module: 'Auth',
      referenceType: 'User',
      referenceId: tenant2.adminUser._id.toString(),
      user: tenant2.adminUser,
      description: 'Tenant 2 Admin login'
    });

    await Product.create({
      organizationId: tenant1.org._id,
      name: 'Tenant 1 Product',
      sku: `SKU-T1-${Date.now()}`,
      costPrice: 500,
      salesPrice: 1000,
      reorderLevel: 10
    });
  });

  after(async () => {
    await disconnectDB();
  });

  it('should record immutable audit logs scoped by organizationId', async () => {
    const logs1 = await AuditLog.find({ organizationId: tenant1.org._id });
    const logs2 = await AuditLog.find({ organizationId: tenant2.org._id });

    assert.strictEqual(logs1.length, 1);
    assert.strictEqual(logs1[0].action, 'PRODUCT_CREATED');
    assert.strictEqual(logs1[0].module, 'Inventory');

    assert.strictEqual(logs2.length, 1);
    assert.strictEqual(logs2[0].action, 'LOGIN');
  });

  it('should compute real Dashboard metrics from MongoDB aggregations', async () => {
    const metrics = await DashboardService.getMetrics(tenant1.org._id);

    assert.ok(metrics);
    assert.ok(metrics.kpis);
    assert.strictEqual(metrics.kpis.lowStockCount, 1, 'Low stock count should reflect zero on-hand vs 10 reorder level');
    assert.ok(Array.isArray(metrics.recentAuditLogs));
    assert.strictEqual(metrics.recentAuditLogs.length, 1);
    assert.strictEqual(metrics.recentAuditLogs[0].action, 'PRODUCT_CREATED');
  });
});
