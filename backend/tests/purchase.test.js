import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import Product from '../src/models/Product.js';
import Vendor from '../src/models/Vendor.js';
import PurchaseOrder from '../src/models/PurchaseOrder.js';
import StockLedger from '../src/models/StockLedger.js';
import { PurchaseService } from '../src/services/purchase.service.js';
import { InventoryService } from '../src/services/inventory.service.js';

describe('Purchase Order Lifecycle & Idempotent Receipt Tests', () => {
  let testTenant;
  let testVendor;
  let testProduct;

  before(async () => {
    await connectDB();
    testTenant = await createTestTenant('Purchase Test Org');

    testVendor = await Vendor.create({
      organizationId: testTenant.org._id,
      name: 'Precision Hardware Ltd',
      email: 'sales@precisionhardware.in'
    });

    testProduct = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Steel Brackets',
      sku: `CMP-BRK-${Date.now()}`,
      costPrice: 50,
      procurementType: 'PURCHASE',
      defaultVendor: testVendor._id
    });
  });

  after(async () => {
    await disconnectDB();
  });

  it('should create and confirm a Purchase Order', async () => {
    const po = await PurchaseService.createOrder({
      organizationId: testTenant.org._id,
      vendor: testVendor._id,
      items: [{ product: testProduct._id, quantity: 100, unitPrice: 50 }],
      user: testTenant.adminUser
    });

    assert.ok(po);
    assert.strictEqual(po.status, 'DRAFT');
    assert.strictEqual(po.totalAmount, 5000);

    const confirmedPO = await PurchaseService.confirmOrder({
      organizationId: testTenant.org._id,
      orderId: po._id,
      user: testTenant.adminUser
    });

    assert.strictEqual(confirmedPO.status, 'SENT');
  });

  it('should support partial goods receipt and update stock', async () => {
    const po = await PurchaseService.createOrder({
      organizationId: testTenant.org._id,
      vendor: testVendor._id,
      items: [{ product: testProduct._id, quantity: 50, unitPrice: 50 }],
      user: testTenant.adminUser
    });

    // Receive 20 of 50
    const partialPO = await PurchaseService.receiveGoods({
      organizationId: testTenant.org._id,
      orderId: po._id,
      itemsToReceive: { [testProduct._id.toString()]: 20 },
      user: testTenant.adminUser
    });

    assert.strictEqual(partialPO.status, 'PARTIALLY_RECEIVED');
    assert.strictEqual(partialPO.items[0].receivedQuantity, 20);

    const avail = await InventoryService.getAvailability(testTenant.org._id, testProduct._id);
    assert.strictEqual(avail.onHand, 20);

    const ledger = await StockLedger.findOne({
      organizationId: testTenant.org._id,
      product: testProduct._id,
      eventType: 'PURCHASE_RECEIPT'
    });
    assert.ok(ledger);
    assert.strictEqual(ledger.quantityChange, 20);
  });

  it('should reject receipt exceeding remaining pending quantity', async () => {
    const po = await PurchaseOrder.findOne({ organizationId: testTenant.org._id, status: 'PARTIALLY_RECEIVED' });
    assert.ok(po);

    // Remaining is 30. Try to receive 40.
    await assert.rejects(
      async () => {
        await PurchaseService.receiveGoods({
          organizationId: testTenant.org._id,
          orderId: po._id,
          itemsToReceive: { [testProduct._id.toString()]: 40 },
          user: testTenant.adminUser
        });
      },
      /Maximum remaining to receive is 30/
    );
  });
});
