import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import Product from '../src/models/Product.js';
import BoM from '../src/models/BoM.js';
import { InventoryService } from '../src/services/inventory.service.js';

describe('Bill of Materials (BoM) Calculation & Validation Tests', () => {
  let testTenant;
  let finishedTable, woodTop, tableLeg, screwPack;
  let tableBoM;

  before(async () => {
    await connectDB();
    testTenant = await createTestTenant('BoM Test Org');

    finishedTable = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Custom Oak Table',
      sku: `FG-OAK-${Date.now()}`,
      salesPrice: 6000,
      costPrice: 3500,
      procurementType: 'MANUFACTURING'
    });

    woodTop = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Oak Table Top',
      sku: `CMP-TOP-${Date.now()}`,
      costPrice: 1200,
      procurementType: 'PURCHASE'
    });

    tableLeg = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Oak Table Leg',
      sku: `CMP-LEG-${Date.now()}`,
      costPrice: 400,
      procurementType: 'PURCHASE'
    });

    screwPack = await Product.create({
      organizationId: testTenant.org._id,
      name: 'Fixing Screws (20pk)',
      sku: `RM-SCREW-${Date.now()}`,
      costPrice: 50,
      procurementType: 'PURCHASE'
    });

    // Stock
    await InventoryService.increase({ organizationId: testTenant.org._id, productId: woodTop._id, quantity: 20, eventType: 'PURCHASE_RECEIPT', referenceType: 'Init', referenceId: '0' });
    await InventoryService.increase({ organizationId: testTenant.org._id, productId: tableLeg._id, quantity: 50, eventType: 'PURCHASE_RECEIPT', referenceType: 'Init', referenceId: '0' });
    await InventoryService.increase({ organizationId: testTenant.org._id, productId: screwPack._id, quantity: 100, eventType: 'PURCHASE_RECEIPT', referenceType: 'Init', referenceId: '0' });

    // BoM: 1 Oak Table = 1 Top, 4 Legs, 1 Screw Pack
    tableBoM = await BoM.create({
      organizationId: testTenant.org._id,
      product: finishedTable._id,
      name: 'BoM Custom Oak Table',
      components: [
        { product: woodTop._id, quantity: 1 },
        { product: tableLeg._id, quantity: 4 },
        { product: screwPack._id, quantity: 1 }
      ]
    });
    finishedTable.bom = tableBoM._id;
    await finishedTable.save();
  });

  after(async () => {
    await disconnectDB();
  });

  it('should calculate dynamic requirements multiplied by target batch quantity', async () => {
    const batchQty = 15; // 15 tables
    const bom = await BoM.findOne({ product: finishedTable._id, organizationId: testTenant.org._id }).populate('components.product');
    assert.ok(bom);

    const requirements = [];
    for (const comp of bom.components) {
      const required = comp.quantity * batchQty;
      const availability = await InventoryService.getAvailability(testTenant.org._id, comp.product._id);
      requirements.push({
        name: comp.product.name,
        required,
        available: availability.available,
        shortage: Math.max(0, required - availability.available)
      });
    }

    // 15 tables require: 15 Tops, 60 Legs, 15 Screw packs
    const topReq = requirements.find(r => r.name === 'Oak Table Top');
    const legReq = requirements.find(r => r.name === 'Oak Table Leg');
    const screwReq = requirements.find(r => r.name === 'Fixing Screws (20pk)');

    assert.strictEqual(topReq.required, 15);
    assert.strictEqual(topReq.available, 20);
    assert.strictEqual(topReq.shortage, 0); // 20 >= 15

    assert.strictEqual(legReq.required, 60);
    assert.strictEqual(legReq.available, 50);
    assert.strictEqual(legReq.shortage, 10); // 50 < 60 -> shortage of 10

    assert.strictEqual(screwReq.required, 15);
    assert.strictEqual(screwReq.available, 100);
    assert.strictEqual(screwReq.shortage, 0);
  });
});
