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
      employeeId: 'EMP99',
      email: 'emp99@test.com',
      password: 'password123',
      role: testTenant.adminRole._id
    });

    const foundUser = await User.findOne({
      organizationId: testTenant.org._id,
      employeeId: 'EMP99'
    }).select('+password');

    assert.ok(foundUser, 'User should be found by Employee ID');
    const isPasswordValid = await foundUser.comparePassword('password123');
    assert.strictEqual(isPasswordValid, true, 'Password comparison should succeed');
  });

  it('should reject invalid password', async () => {
    const foundUser = await User.findOne({ organizationId: testTenant.org._id, employeeId: 'ADM01' }).select('+password');
    assert.ok(foundUser);
    const isPasswordValid = await foundUser.comparePassword('wrongpassword');
    assert.strictEqual(isPasswordValid, false, 'Invalid password should be rejected');
  });
});
