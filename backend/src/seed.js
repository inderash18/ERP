import 'dotenv/config';
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import Organization from './models/Organization.js';
import Role from './models/Role.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Vendor from './models/Vendor.js';
import Customer from './models/Customer.js';
import Product from './models/Product.js';
import BoM from './models/BoM.js';
import WorkCenter from './models/WorkCenter.js';
import InventoryBalance from './models/InventoryBalance.js';
import StockLedger from './models/StockLedger.js';
import SalesOrder from './models/SalesOrder.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import ManufacturingOrder from './models/ManufacturingOrder.js';
import AuditLog from './models/AuditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-erp';

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected successfully.`);

    console.log(`Cleaning existing collections...`);
    await Promise.all([
      Organization.deleteMany({}),
      Role.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
      Vendor.deleteMany({}),
      Customer.deleteMany({}),
      Product.deleteMany({}),
      BoM.deleteMany({}),
      WorkCenter.deleteMany({}),
      InventoryBalance.deleteMany({}),
      StockLedger.deleteMany({}),
      SalesOrder.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      ManufacturingOrder.deleteMany({}),
      AuditLog.deleteMany({})
    ]);
    console.log(`All existing collections wiped cleanly.`);

    // Read initialDataset.json
    const datasetPath = path.resolve(__dirname, 'data', 'initialDataset.json');
    const datasetRaw = fs.readFileSync(datasetPath, 'utf-8');
    const dataset = JSON.parse(datasetRaw);

    // 1. Create Organization
    console.log(`Creating Organization: ${dataset.organization.name}...`);
    const org = await Organization.create(dataset.organization);

    // 2. Create Roles
    console.log(`Creating granular system roles...`);
    const roleMap = new Map();
    for (const r of dataset.roles) {
      const createdRole = await Role.create({
        organizationId: org._id,
        name: r.name,
        permissions: r.permissions,
        isSystem: r.isSystem
      });
      roleMap.set(r.name, createdRole);
    }
    console.log(`Created ${roleMap.size} roles.`);

    // 3. Create Users
    console.log(`Creating user accounts for all system roles...`);
    const usersList = dataset.users || [dataset.user];
    const createdUsers = [];

    for (const u of usersList) {
      const assignedRole = roleMap.get(u.roleName) || roleMap.get('Admin');
      const createdUser = await User.create({
        organizationId: org._id,
        firstName: u.firstName,
        lastName: u.lastName,
        employeeId: u.employeeId,
        email: u.email,
        password: u.password,
        department: u.department,
        role: assignedRole._id,
        status: u.status || 'ACTIVE'
      });
      createdUsers.push(createdUser);
      console.log(`  ✔ [${assignedRole.name}] User created: ${createdUser.firstName} ${createdUser.lastName} (${createdUser.employeeId} / ${createdUser.email})`);
    }
    const singleUser = createdUsers[0];

    // 4. Create Categories
    console.log(`Creating product categories...`);
    const categoryMap = new Map();
    for (const c of dataset.categories) {
      const createdCat = await Category.create({
        organizationId: org._id,
        name: c.name,
        description: c.description
      });
      categoryMap.set(c.name, createdCat);
    }

    // 5. Create Vendors
    console.log(`Creating vendors...`);
    const vendorMap = new Map();
    for (const v of dataset.vendors) {
      const createdVendor = await Vendor.create({
        organizationId: org._id,
        name: v.name,
        email: v.email,
        phone: v.phone,
        address: v.address,
        status: v.status
      });
      vendorMap.set(v.name, createdVendor);
    }

    // 6. Create Customers
    console.log(`Creating customers...`);
    for (const cust of dataset.customers) {
      await Customer.create({
        organizationId: org._id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        address: cust.address,
        status: cust.status
      });
    }

    // 7. Create Work Centers
    console.log(`Creating work centers...`);
    const workCenterMap = new Map();
    for (const wc of dataset.workCenters) {
      const createdWc = await WorkCenter.create({
        organizationId: org._id,
        name: wc.name,
        code: wc.code,
        costPerHour: wc.costPerHour,
        capacity: wc.capacity
      });
      workCenterMap.set(wc.code, createdWc);
    }

    // 8. Create Products & Initial Inventory Balances & Stock Ledger
    console.log(`Creating products and initializing stock ledger...`);
    const productMap = new Map();
    for (const p of dataset.products) {
      const cat = categoryMap.get(p.categoryName);
      const vend = p.defaultVendorName ? vendorMap.get(p.defaultVendorName) : null;

      const createdProd = await Product.create({
        organizationId: org._id,
        name: p.name,
        sku: p.sku,
        category: cat ? cat._id : undefined,
        type: p.type,
        unit: p.unit,
        salesPrice: p.salesPrice,
        costPrice: p.costPrice,
        procurementStrategy: p.procurementStrategy,
        procurementType: p.procurementType,
        defaultVendor: vend ? vend._id : undefined,
        reorderLevel: p.reorderLevel,
        targetStock: p.targetStock,
        isActive: true
      });
      productMap.set(p.sku, createdProd);

      const initStock = p.initialStock || 0;
      await InventoryBalance.create({
        organizationId: org._id,
        product: createdProd._id,
        onHand: initStock,
        reserved: 0,
        incoming: 0
      });

      if (initStock > 0) {
        await StockLedger.create({
          organizationId: org._id,
          product: createdProd._id,
          eventType: 'INITIAL_STOCK_SEED',
          quantityChange: initStock,
          previousOnHand: 0,
          newOnHand: initStock,
          previousReserved: 0,
          newReserved: 0,
          referenceType: 'SYSTEM_SEED',
          referenceId: 'DATASET_SEED',
          userId: singleUser._id,
          notes: `Initial baseline stock seeded from master dataset`
        });
      }
    }

    // 9. Create Bills of Materials (BoM)
    console.log(`Creating Bills of Materials (BoMs)...`);
    for (const b of dataset.boms) {
      const finishedProd = productMap.get(b.productSku);
      if (!finishedProd) continue;

      const bomComponents = b.components.map(comp => {
        const compProd = productMap.get(comp.sku);
        return {
          product: compProd._id,
          quantity: comp.quantity,
          unit: comp.unit,
          scrapPercentage: comp.scrapPercentage || 0
        };
      });

      const bomOperations = b.operations.map(op => {
        const wc = workCenterMap.get(op.workCenterCode);
        return {
          sequence: op.sequence,
          workCenter: wc ? wc._id : undefined,
          name: op.operationName || op.name,
          durationMinutes: op.durationMinutes
        };
      });

      const createdBom = await BoM.create({
        organizationId: org._id,
        product: finishedProd._id,
        name: b.name,
        baseQuantity: b.baseQuantity,
        components: bomComponents,
        operations: bomOperations,
        isActive: true
      });

      await Product.findByIdAndUpdate(finishedProd._id, { bom: createdBom._id });
    }

    // 10. Create Initial System Audit Log
    console.log(`Recording system initialization audit log...`);
    await AuditLog.create({
      organizationId: org._id,
      action: 'SYSTEM_SEED',
      module: 'Administration',
      referenceType: 'Organization',
      referenceId: org._id.toString(),
      userId: singleUser._id,
      userEmail: singleUser.email,
      userName: singleUser.name,
      description: `Database initialized with pre-built dataset for ${org.name}. Single master admin configured.`
    });

    console.log(`\n======================================================`);
    console.log(`✔ DATABASE SEEDING COMPLETED SUCCESSFULLY`);
    console.log(`------------------------------------------------------`);
    console.log(`Organization : ${org.name}`);
    console.log(`Users Created: ${createdUsers.length} active role accounts`);
    console.log(`Master Admin : ADMIN01 / admin@shivfurniture.in (password123)`);
    console.log(`Products     : ${productMap.size} loaded with initial inventory`);
    console.log(`Categories   : ${categoryMap.size}`);
    console.log(`Vendors      : ${vendorMap.size}`);
    console.log(`======================================================\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during database seeding:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
