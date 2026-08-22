import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import Product from '../src/models/Product.js';
import Customer from '../src/models/Customer.js';
import Vendor from '../src/models/Vendor.js';
import BoM from '../src/models/BoM.js';
import SalesOrder from '../src/models/SalesOrder.js';
import PurchaseOrder from '../src/models/PurchaseOrder.js';
import ManufacturingOrder from '../src/models/ManufacturingOrder.js';
import { InventoryService } from '../src/services/inventory.service.js';
import { SalesService } from '../src/services/sales.service.js';
import { PurchaseService } from '../src/services/purchase.service.js';
import { ManufacturingService } from '../src/services/manufacturing.service.js';

describe('End-to-End MTS and MTO Business Flow Tests', () => {
  let testTenant;
  let testCustomer;
  let testVendor;
  let rawWood, tableLeg, screws;
  let woodenTable, officeChair;
  let tableBoM;

  before(async () => {
    await connectDB();
    testTenant = await createTestTenant('ELVARA FURNITURE Flow Test');

    testCustomer = await Customer.create({
      organizationId: testTenant.org._id,
      name: 'Apex Home Decor',
      email: 'apex@test.com'
    });

    testVendor = await Vendor.create({
      organizationId: testTenant.org._id,
      name: 'Timber Supplier Ltd',
      email: 'timber@test.com'
    });

    // Create Components
    rawWood = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Wood Panel',
      sku: `RM-WOOD-${Date.now()}`,
      costPrice: 400,
      procurementType: 'PURCHASE'
    });

    tableLeg = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Table Leg',
      sku: `CMP-LEG-${Date.now()}`,
      costPrice: 150,
      procurementType: 'PURCHASE'
    });

    screws = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Screws',
      sku: `RM-SCRW-${Date.now()}`,
      costPrice: 2,
      procurementType: 'PURCHASE'
    });

    // Initial stock for components
    await InventoryService.increase({ organizationId: testTenant.org._id, productId: rawWood._id, quantity: 100, eventType: 'PURCHASE_RECEIPT', referenceType: 'InitialSetup', referenceId: rawWood._id, userId: testTenant.adminUser._id });
    await InventoryService.increase({ organizationId: testTenant.org._id, productId: tableLeg._id, quantity: 100, eventType: 'PURCHASE_RECEIPT', referenceType: 'InitialSetup', referenceId: tableLeg._id, userId: testTenant.adminUser._id });
    await InventoryService.increase({ organizationId: testTenant.org._id, productId: screws._id, quantity: 500, eventType: 'PURCHASE_RECEIPT', referenceType: 'InitialSetup', referenceId: screws._id, userId: testTenant.adminUser._id });

    // Create Finished Goods
    woodenTable = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Wooden Study Table',
      sku: `FG-TABLE-${Date.now()}`,
      costPrice: 2500,
      salesPrice: 4500,
      procurementType: 'MANUFACTURING'
    });

    officeChair = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Office Chair',
      sku: `FG-CHAIR-${Date.now()}`,
      costPrice: 1500,
      salesPrice: 3000,
      procurementType: 'PURCHASE',
      defaultVendor: testVendor._id
    });

    // Initial stock for Finished Goods
    await InventoryService.increase({ organizationId: testTenant.org._id, productId: woodenTable._id, quantity: 5, eventType: 'STOCK_ADJUSTMENT', referenceType: 'InitialSetup', referenceId: woodenTable._id, userId: testTenant.adminUser._id });
    await InventoryService.increase({ organizationId: testTenant.org._id, productId: officeChair._id, quantity: 2, eventType: 'STOCK_ADJUSTMENT', referenceType: 'InitialSetup', referenceId: officeChair._id, userId: testTenant.adminUser._id });

    // Create BoM for Wooden Table
    tableBoM = await BoM.create({
      organizationId: testTenant.org._id,
      product: woodenTable._id,
      name: 'BoM Wooden Table',
      components: [
        { product: rawWood._id, quantity: 2 },
        { product: tableLeg._id, quantity: 4 },
        { product: screws._id, quantity: 12 }
      ]
    });
    woodenTable.bom = tableBoM._id;
    await woodenTable.save();
  });

  after(async () => {
    await disconnectDB();
  });

  it('SCENARIO 1 (MTS): Should reserve stock and fulfill order when sufficient stock is available', async () => {
    // Current stock of Wooden Table is 5. Order 3.
    const so = await SalesService.createOrder({
      organizationId: testTenant.org._id,
      customer: testCustomer._id,
      items: [{ product: woodenTable._id, quantity: 3 }],
      user: testTenant.adminUser
    });

    const confirmRes = await SalesService.confirmOrder({
      organizationId: testTenant.org._id,
      orderId: so._id,
      user: testTenant.adminUser
    });

    assert.strictEqual(confirmRes.hasAnyShortage, false, 'MTS should have zero shortage');
    assert.strictEqual(confirmRes.order.status, 'CONFIRMED');

    // Deliver order
    const deliveredOrder = await SalesService.deliverOrder({
      organizationId: testTenant.org._id,
      orderId: so._id,
      user: testTenant.adminUser
    });

    assert.strictEqual(deliveredOrder.status, 'DELIVERED');

    const avail = await InventoryService.getAvailability(testTenant.org._id, woodenTable._id);
    assert.strictEqual(avail.onHand, 2, 'Stock should decrease from 5 to 2');
  });

  it('SCENARIO 2 (MTO Manufacturing): Should detect shortage of 15 tables, auto-create MO, consume BoM components, produce FG, and fulfill Sales Order', async () => {
    // Current stock is 2. Order 17. Shortage = 15.
    const so = await SalesService.createOrder({
      organizationId: testTenant.org._id,
      customer: testCustomer._id,
      items: [{ product: woodenTable._id, quantity: 17 }],
      user: testTenant.adminUser
    });

    const confirmRes = await SalesService.confirmOrder({
      organizationId: testTenant.org._id,
      orderId: so._id,
      user: testTenant.adminUser
    });

    assert.strictEqual(confirmRes.hasAnyShortage, true, 'Shortage should be detected');
    assert.strictEqual(confirmRes.order.status, 'PROCESSING_MTO');

    // Verify Manufacturing Order auto-created for shortage of 15
    const mo = await ManufacturingOrder.findOne({
      organizationId: testTenant.org._id,
      salesOrderId: so._id
    });

    assert.ok(mo, 'Manufacturing Order must be auto-generated');
    assert.strictEqual(mo.quantityToProduce, 15, 'MO quantity must match shortage of 15');

    // Complete Manufacturing Order -> Consumes components & produces 15 tables
    const completedMO = await ManufacturingService.completeOrder({
      organizationId: testTenant.org._id,
      orderId: mo._id,
      user: testTenant.adminUser
    });

    assert.strictEqual(completedMO.status, 'COMPLETED');

    // Stock was 2 + 15 produced = 17 available
    const availAfterMfg = await InventoryService.getAvailability(testTenant.org._id, woodenTable._id);
    assert.strictEqual(availAfterMfg.onHand, 17, 'Finished goods should be restocked to 17');

    // Now fulfill and deliver the sales order
    const deliveredOrder = await SalesService.deliverOrder({
      organizationId: testTenant.org._id,
      orderId: so._id,
      user: testTenant.adminUser
    });

    assert.strictEqual(deliveredOrder.status, 'DELIVERED');

    const finalAvail = await InventoryService.getAvailability(testTenant.org._id, woodenTable._id);
    assert.strictEqual(finalAvail.onHand, 0, 'All 17 tables delivered to customer');
  });

  it('SCENARIO 3 (MTO Purchase): Should detect shortage of 8 chairs, auto-create PO, receive goods, and fulfill Sales Order', async () => {
    // Current stock of Office Chair is 2. Order 10. Shortage = 8.
    const so = await SalesService.createOrder({
      organizationId: testTenant.org._id,
      customer: testCustomer._id,
      items: [{ product: officeChair._id, quantity: 10 }],
      user: testTenant.adminUser
    });

    const confirmRes = await SalesService.confirmOrder({
      organizationId: testTenant.org._id,
      orderId: so._id,
      user: testTenant.adminUser
    });

    assert.strictEqual(confirmRes.hasAnyShortage, true);

    const po = await PurchaseOrder.findOne({
      organizationId: testTenant.org._id,
      salesOrderId: so._id
    });

    assert.ok(po, 'Purchase Order must be auto-generated for purchase procurement type');
    assert.strictEqual(po.items[0].quantity, 8, 'PO quantity must match shortage of 8');

    // Receive goods on PO
    await PurchaseService.receiveGoods({
      organizationId: testTenant.org._id,
      orderId: po._id,
      user: testTenant.adminUser
    });

    // Stock was 2 + 8 received = 10
    const availAfterPO = await InventoryService.getAvailability(testTenant.org._id, officeChair._id);
    assert.strictEqual(availAfterPO.onHand, 10);

    // Deliver Sales Order
    const deliveredOrder = await SalesService.deliverOrder({
      organizationId: testTenant.org._id,
      orderId: so._id,
      user: testTenant.adminUser
    });

    assert.strictEqual(deliveredOrder.status, 'DELIVERED');
  });
});
