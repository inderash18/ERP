import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import Product from '../src/models/Product.js';
import SalesOrder from '../src/models/SalesOrder.js';

describe('Multi-Tenancy & Data Isolation Tests', () => {
  let tenantA, tenantB;
  let prodA, prodB;

  before(async () => {
    await connectDB();
    tenantA = await createTestTenant('Tenant Alpha Isolation');
    tenantB = await createTestTenant('Tenant Beta Isolation');

    prodA = await Product.create({
      organizationId: tenantA.org._id,
      name: 'Alpha Proprietary Furniture',
      sku: `SKU-ALPHA-${Date.now()}`,
      costPrice: 100,
      salesPrice: 200
    });

    prodB = await Product.create({
      organizationId: tenantB.org._id,
      name: 'Beta Furniture Model',
      sku: `SKU-BETA-${Date.now()}`,
      costPrice: 50,
      salesPrice: 100
    });
  });

  after(async () => {
    await disconnectDB();
  });

  it('should isolate product queries between tenants (Read Isolation)', async () => {
    const productsForA = await Product.find({ organizationId: tenantA.org._id });
    const productsForB = await Product.find({ organizationId: tenantB.org._id });

    assert.strictEqual(productsForA.length, 1);
    assert.strictEqual(productsForA[0].name, 'Alpha Proprietary Furniture');

    assert.strictEqual(productsForB.length, 1);
    assert.strictEqual(productsForB[0].name, 'Beta Furniture Model');
  });

  it('Tenant A should not be able to find or query Tenant B products (Cross-tenant Leak Prevention)', async () => {
    const forbiddenDoc = await Product.findOne({
      _id: prodB._id,
      organizationId: tenantA.org._id
    });
    assert.strictEqual(forbiddenDoc, null, 'Tenant A query must never return Tenant B records');
  });

  it('Tenant A should not be able to update Tenant B products (Write Isolation)', async () => {
    const updateResult = await Product.updateOne(
      { _id: prodB._id, organizationId: tenantA.org._id },
      { name: 'Hacked Beta Product' }
    );
    assert.strictEqual(updateResult.matchedCount, 0, 'Tenant A update must not match Tenant B document');

    const unchangedDoc = await Product.findById(prodB._id);
    assert.strictEqual(unchangedDoc.name, 'Beta Furniture Model');
  });

  it('Tenant A should not be able to delete Tenant B products (Delete Isolation)', async () => {
    const deleteResult = await Product.deleteOne({
      _id: prodB._id,
      organizationId: tenantA.org._id
    });
    assert.strictEqual(deleteResult.deletedCount, 0, 'Tenant A delete must not delete Tenant B document');

    const remainingDoc = await Product.findById(prodB._id);
    assert.ok(remainingDoc, 'Tenant B document must still exist');
  });
});
