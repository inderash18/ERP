import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hasPermission } from '../src/middleware/auth.js';

describe('RBAC Wildcard & Permission Matcher Tests', () => {
  it('should allow wildcard * permission for any required action', () => {
    const adminPermissions = ['*'];
    assert.strictEqual(hasPermission(adminPermissions, 'product.view'), true);
    assert.strictEqual(hasPermission(adminPermissions, 'sales.create'), true);
    assert.strictEqual(hasPermission(adminPermissions, 'inventory.adjust'), true);
    assert.strictEqual(hasPermission(adminPermissions, 'manufacturing.complete'), true);
  });

  it('should match domain wildcards (e.g. sales.*)', () => {
    const salesPermissions = ['sales.*', 'customer.view'];
    assert.strictEqual(hasPermission(salesPermissions, 'sales.view'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'sales.create'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'sales.confirm'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'sales.deliver'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'sales.delete'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'customer.view'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'inventory.adjust'), false);
    assert.strictEqual(hasPermission(salesPermissions, 'manufacturing.complete'), false);
  });

  it('should match exact permissions', () => {
    const exactPermissions = ['inventory.view', 'inventory.adjust'];
    assert.strictEqual(hasPermission(exactPermissions, 'inventory.view'), true);
    assert.strictEqual(hasPermission(exactPermissions, 'inventory.adjust'), true);
    assert.strictEqual(hasPermission(exactPermissions, 'inventory.delete'), false);
    assert.strictEqual(hasPermission(exactPermissions, 'sales.view'), false);
  });

  it('should reject unauthorized operations', () => {
    const mfgPermissions = ['manufacturing.*', 'bom.*'];
    assert.strictEqual(hasPermission(mfgPermissions, 'manufacturing.create'), true);
    assert.strictEqual(hasPermission(mfgPermissions, 'bom.calculate'), true);
    assert.strictEqual(hasPermission(mfgPermissions, 'purchase.create'), false);
    assert.strictEqual(hasPermission(mfgPermissions, 'sales.deliver'), false);
  });
});
