import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import Product from '../src/models/Product.js';
import { InventoryService } from '../src/services/inventory.service.js';

describe('Concurrency & Stock Invariant Tests', () => {
  let testTenant;
  let testProduct;

  before(async () => {
    await connectDB();
    testTenant = await createTestTenant('Concurrency Test Org');

    testProduct = await Product.create({
      organizationId: testTenant.org._id,
      name: 'High Demand Dining Table',
      sku: `SKU-DINE-${Date.now()}`,
      salesPrice: 8000,
      costPrice: 4000
    });

    // Initial stock = 10
    await InventoryService.increase({
      organizationId: testTenant.org._id,
      productId: testProduct._id,
      quantity: 10,
      eventType: 'PURCHASE_RECEIPT',
      referenceType: 'InitialSetup',
      referenceId: testProduct._id,
      userId: testTenant.adminUser._id
    });
  });

  after(async () => {
    await disconnectDB();
  });

  it('should prevent race condition when 2 concurrent requests try to reserve 8 units each on 10 stock', async () => {
    // Both try to reserve 8 simultaneously (8 + 8 = 16 > 10)
    const promises = [
      InventoryService.reserve({
        organizationId: testTenant.org._id,
        productId: testProduct._id,
        quantity: 8,
        referenceType: 'SalesOrder',
        referenceId: 'SO-CONC-01',
        userId: testTenant.adminUser._id
      }),
      InventoryService.reserve({
        organizationId: testTenant.org._id,
        productId: testProduct._id,
        quantity: 8,
        referenceType: 'SalesOrder',
        referenceId: 'SO-CONC-02',
        userId: testTenant.adminUser._id
      })
    ];

    const results = await Promise.allSettled(promises);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    // Exactly one should succeed, and one should fail
    assert.strictEqual(fulfilled.length, 1, 'Only one concurrent reservation of 8 on 10 stock should succeed');
    assert.strictEqual(rejected.length, 1, 'The second concurrent reservation must be rejected');

    // Verify stock invariant
    const finalAvail = await InventoryService.getAvailability(testTenant.org._id, testProduct._id);
    assert.strictEqual(finalAvail.onHand, 10);
    assert.strictEqual(finalAvail.reserved, 8);
    assert.strictEqual(finalAvail.available, 2);
    assert.ok(finalAvail.reserved <= finalAvail.onHand, 'Invariant: reserved <= onHand must hold');
  });
});
