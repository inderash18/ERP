import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import Product from '../src/models/Product.js';
import StockLedger from '../src/models/StockLedger.js';
import { InventoryService } from '../src/services/inventory.service.js';

describe('Inventory Engine & Atomic Transaction Tests', () => {
  let testTenant;
  let testProduct;

  before(async () => {
    await connectDB();
    testTenant = await createTestTenant('Inventory Test Org');

    testProduct = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Test Steel Bar',
      sku: `SKU-STL-${Date.now()}`,
      salesPrice: 500,
      costPrice: 300
    });
  });

  after(async () => {
    await disconnectDB();
  });

  it('should increase stock and record in StockLedger atomically', async () => {
    const result = await InventoryService.increase({
      organizationId: testTenant.org._id,
      productId: testProduct._id,
      quantity: 50,
      eventType: 'PURCHASE_RECEIPT',
      referenceType: 'TestPO',
      referenceId: 'PO-001',
      userId: testTenant.adminUser._id,
      notes: 'Initial test stock intake'
    });

    assert.ok(result.success);
    assert.strictEqual(result.balance.onHand, 50);

    const ledger = await StockLedger.findOne({
      organizationId: testTenant.org._id,
      product: testProduct._id,
      referenceId: 'PO-001'
    });

    assert.ok(ledger);
    assert.strictEqual(ledger.quantityChange, 50);
    assert.strictEqual(ledger.newOnHand, 50);
  });

  it('should reserve stock and update available calculation', async () => {
    const resResult = await InventoryService.reserve({
      organizationId: testTenant.org._id,
      productId: testProduct._id,
      quantity: 20,
      referenceType: 'TestSO',
      referenceId: 'SO-001',
      userId: testTenant.adminUser._id
    });

    assert.ok(resResult.success);
    assert.strictEqual(resResult.balance.reserved, 20);

    const availability = await InventoryService.getAvailability(testTenant.org._id, testProduct._id);
    assert.strictEqual(availability.onHand, 50);
    assert.strictEqual(availability.reserved, 20);
    assert.strictEqual(availability.available, 30);
  });

  it('should prevent reserving more stock than available', async () => {
    await assert.rejects(
      async () => {
        await InventoryService.reserve({
          organizationId: testTenant.org._id,
          productId: testProduct._id,
          quantity: 40, // only 30 available
          referenceType: 'TestSO',
          referenceId: 'SO-002',
          userId: testTenant.adminUser._id
        });
      },
      /Insufficient available stock/
    );
  });

  it('should decrease stock and create negative movement ledger entry', async () => {
    const decResult = await InventoryService.decrease({
      organizationId: testTenant.org._id,
      productId: testProduct._id,
      quantity: 10,
      eventType: 'SALES_DELIVERY',
      referenceType: 'TestSO',
      referenceId: 'SO-001',
      userId: testTenant.adminUser._id,
      notes: 'Test sales delivery'
    });

    assert.ok(decResult.success);
    assert.strictEqual(decResult.balance.onHand, 40);

    const ledger = await StockLedger.findOne({
      organizationId: testTenant.org._id,
      product: testProduct._id,
      eventType: 'SALES_DELIVERY'
    });

    assert.ok(ledger);
    assert.strictEqual(ledger.quantityChange, -10);
  });
});
