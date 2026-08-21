import 'dotenv/config';
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}
import mongoose from 'mongoose';
import Organization from '../src/models/Organization.js';
import Role from '../src/models/Role.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import BoM from '../src/models/BoM.js';
import InventoryBalance from '../src/models/InventoryBalance.js';
import StockLedger from '../src/models/StockLedger.js';
import SalesOrder from '../src/models/SalesOrder.js';
import PurchaseOrder from '../src/models/PurchaseOrder.js';
import ManufacturingOrder from '../src/models/ManufacturingOrder.js';
import AuditLog from '../src/models/AuditLog.js';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-erp';

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export async function clearDB() {
  await Promise.all([
    Organization.deleteMany({}),
    Role.deleteMany({}),
    User.deleteMany({}),
    Product.deleteMany({}),
    BoM.deleteMany({}),
    InventoryBalance.deleteMany({}),
    StockLedger.deleteMany({}),
    SalesOrder.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    ManufacturingOrder.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

export async function createTestTenant(name = 'Test Org') {
  const uniqueDomain = `test-${Date.now()}-${Math.floor(Math.random() * 10000)}.com`;
  const org = await Organization.create({
    name,
    domain: uniqueDomain
  });

  const adminRole = await Role.create({
    organizationId: org._id,
    name: 'ADMIN',
    permissions: ['*'],
    isSystem: true
  });

  const salesRole = await Role.create({
    organizationId: org._id,
    name: 'SALES',
    permissions: ['sales.*', 'customer.*', 'product.view'],
    isSystem: false
  });

  const adminUser = await User.create({
    organizationId: org._id,
    firstName: 'Admin',
    lastName: 'Test',
    employeeId: 'ADM01',
    email: `admin@${name.replace(/\s+/g, '').toLowerCase()}.com`,
    password: 'password123',
    role: adminRole._id
  });

  const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'fallback_secret_for_dev');

  return { org, adminRole, salesRole, adminUser, token };
}
