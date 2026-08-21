import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB, createTestTenant } from './helpers.js';
import User from '../src/models/User.js';

describe('Authentication & User Resolution Tests', () => {
  let testTenant;

  before(async () => {
    await connectDB();
    testTenant = await createTestTenant('Auth Test Org');
  });

  after(async () => {
    await disconnectDB();
  });

  it('should authenticate user via Employee ID and Password', async () => {
    const user = await User.create({
      organizationId: testTenant.org._id,
      firstName: 'Employee',
      lastName: 'One',
      employeeId: `EMP-${Date.now()}`,
      email: `emp-${Date.now()}@test.com`,
      password: 'password123',
      role: testTenant.adminRole._id
    });

    const foundUser = await User.findOne({
      organizationId: testTenant.org._id,
      employeeId: user.employeeId
    }).select('+password');

    assert.ok(foundUser, 'User should be found by Employee ID');
    const isPasswordValid = await foundUser.comparePassword('password123');
    assert.strictEqual(isPasswordValid, true, 'Password comparison should succeed');
  });

  it('should authenticate user via Email and Password', async () => {
    const email = `emailuser-${Date.now()}@test.com`;
    const user = await User.create({
      organizationId: testTenant.org._id,
      firstName: 'Email',
      lastName: 'User',
      employeeId: `EMU-${Date.now()}`,
      email,
      password: 'password123',
      role: testTenant.salesRole._id
    });

    const foundUser = await User.findOne({
      organizationId: testTenant.org._id,
      email
    }).select('+password');

    assert.ok(foundUser);
    const isPasswordValid = await foundUser.comparePassword('password123');
    assert.strictEqual(isPasswordValid, true);
  });

  it('should reject invalid password', async () => {
    const foundUser = await User.findOne({ organizationId: testTenant.org._id, employeeId: 'ADM01' }).select('+password');
    assert.ok(foundUser);
    const isPasswordValid = await foundUser.comparePassword('wrongpassword');
    assert.strictEqual(isPasswordValid, false, 'Invalid password should be rejected');
  });
});
