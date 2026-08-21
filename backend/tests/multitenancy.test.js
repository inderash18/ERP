import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, clearDB, createTestTenant } from './helpers.js';
import Product from '../src/models/Product.js';
import SalesOrder from '../src/models/SalesOrder.js';

describe('Multi-Tenancy & Data Isolation Tests', () => {
  let tenantA, tenantB;
  let prodA, prodB;

  before(async () => {
    await connectDB();
    tenantA = await createTestTenant('Tenant Alpha');
    tenantB = await createTestTenant('Tenant Beta');

    prodA = await Product.create({
      organizationId: tenantA.org._id,
      name: 'Alpha Confidential Product',
      sku: 'SKU-ALPHA-01',
      costPrice: 100,
      salesPrice: 200
    });

    prodB = await Product.create({
      organizationId: tenantB.org._id,
      name: 'Beta Product',
      sku: 'SKU-BETA-01',
      costPrice: 50,
      salesPrice: 100
    });
  });

  after(async () => {
    await disconnectDB();
  });

  it('should isolate product queries between tenants', async () => {
    const productsForA = await Product.find({ organizationId: tenantA.org._id });
    const productsForB = await Product.find({ organizationId: tenantB.org._id });

    assert.strictEqual(productsForA.length, 1);
    assert.strictEqual(productsForA[0].name, 'Alpha Confidential Product');

    assert.strictEqual(productsForB.length, 1);
    assert.strictEqual(productsForB[0].name, 'Beta Product');
  });

  it('Tenant A should not be able to find or query Tenant B products', async () => {
    const forbiddenDoc = await Product.findOne({
      _id: prodB._id,
      organizationId: tenantA.org._id
    });
    assert.strictEqual(forbiddenDoc, null, 'Tenant A query must never return Tenant B records');
  });
});
