import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hasPermission } from '../src/middleware/auth.js';

describe('RBAC Wildcard & Permission Matcher Tests', () => {
  it('should allow wildcard * permission for any required action', () => {
    const adminPermissions = ['*'];
    assert.strictEqual(hasPermission(adminPermissions, 'product.view'), true);
    assert.strictEqual(hasPermission(adminPermissions, 'sales.create'), true);
    assert.strictEqual(hasPermission(adminPermissions, 'inventory.adjust'), true);
  });

  it('should match domain wildcards (e.g. sales.*)', () => {
    const salesPermissions = ['sales.*', 'customer.view'];
    assert.strictEqual(hasPermission(salesPermissions, 'sales.view'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'sales.create'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'sales.delete'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'customer.view'), true);
    assert.strictEqual(hasPermission(salesPermissions, 'inventory.adjust'), false);
  });

  it('should reject unauthorized operations', () => {
    const mfgPermissions = ['manufacturing.*', 'bom.view'];
    assert.strictEqual(hasPermission(mfgPermissions, 'manufacturing.create'), true);
    assert.strictEqual(hasPermission(mfgPermissions, 'purchase.create'), false);
    assert.strictEqual(hasPermission(mfgPermissions, 'sales.deliver'), false);
  });
});
