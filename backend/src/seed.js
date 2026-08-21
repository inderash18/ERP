import 'dotenv/config';
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    console.log(`Existing collections cleaned.`);

    // 1. Create Organization
    console.log(`Creating Organization: Shiv Furniture Works...`);
    const org = await Organization.create({
      name: 'Shiv Furniture Works',
      domain: 'shivfurniture.in',
      status: 'ACTIVE',
      settings: {
        currency: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata'
      }
    });

    // 2. Create Roles
    console.log(`Creating Roles with granular RBAC permissions...`);
    const adminRole = await Role.create({
      organizationId: org._id,
      name: 'ADMIN',
      permissions: ['*'],
      isSystem: true
    });

    const salesRole = await Role.create({
      organizationId: org._id,
      name: 'SALES',
      permissions: ['sales.*', 'customer.*', 'product.view', 'inventory.view'],
      isSystem: false
    });

    const purchaseRole = await Role.create({
      organizationId: org._id,
      name: 'PURCHASE',
      permissions: ['purchase.*', 'vendor.*', 'product.*', 'inventory.view'],
      isSystem: false
    });

    const mfgRole = await Role.create({
      organizationId: org._id,
      name: 'MANUFACTURING',
      permissions: ['manufacturing.*', 'bom.*', 'inventory.view', 'product.view'],
      isSystem: false
    });

    const invRole = await Role.create({
      organizationId: org._id,
      name: 'INVENTORY',
      permissions: ['inventory.*', 'product.*', 'stock.*'],
      isSystem: false
    });

    // 3. Create Users
    console.log(`Creating Seed Users & Employees...`);
    const hashedPassword = await bcrypt.hash('password123', 12);

    const adminUser = await User.create({
      organizationId: org._id,
      firstName: 'Arjun',
      lastName: 'Shiv',
      employeeId: 'OWNER01',
      department: 'Executive',
      email: 'arjun@shivfurniture.in',
      password: hashedPassword,
      role: adminRole._id,
      status: 'ACTIVE'
    });

    const systemAdmin = await User.create({
      organizationId: org._id,
      firstName: 'System',
      lastName: 'Admin',
      employeeId: 'ADMIN01',
      department: 'IT',
      email: 'admin@shivfurniture.in',
      password: hashedPassword,
      role: adminRole._id,
      status: 'ACTIVE'
    });

    await User.create({
      organizationId: org._id,
      firstName: 'IT',
      lastName: 'Support',
      employeeId: 'ADMIN02',
      department: 'IT',
      email: 'support@shivfurniture.in',
      password: hashedPassword,
      role: adminRole._id,
      status: 'ACTIVE'
    });

    await User.create({
      organizationId: org._id,
      firstName: 'Alexander',
      lastName: 'Reed',
      employeeId: 'ADMIN03',
      department: 'Executive',
      email: 'admin@minierp.io',
      password: hashedPassword,
      role: adminRole._id,
      status: 'ACTIVE'
    });

    // Department Users
    for (let i = 1; i <= 10; i++) {
      const pad = String(i).padStart(2, '0');
      await User.create({
        organizationId: org._id,
        firstName: `Sales`,
        lastName: `Rep ${i}`,
        employeeId: `SALE${pad}`,
        department: 'Sales',
        email: `sale${i}@shivfurniture.in`,
        password: hashedPassword,
        role: salesRole._id,
        status: 'ACTIVE'
      });

      await User.create({
        organizationId: org._id,
        firstName: `Purchase`,
        lastName: `Agent ${i}`,
        employeeId: `PUR${pad}`,
        department: 'Procurement',
        email: `pur${i}@shivfurniture.in`,
        password: hashedPassword,
        role: purchaseRole._id,
        status: 'ACTIVE'
      });

      await User.create({
        organizationId: org._id,
        firstName: `Mfg`,
        lastName: `Engineer ${i}`,
        employeeId: `MFG${pad}`,
        department: 'Manufacturing',
        email: `mfg${i}@shivfurniture.in`,
        password: hashedPassword,
        role: mfgRole._id,
        status: 'ACTIVE'
      });
    }

    for (let i = 1; i <= 5; i++) {
      const pad = String(i).padStart(2, '0');
      await User.create({
        organizationId: org._id,
        firstName: `Inventory`,
        lastName: `Manager ${i}`,
        employeeId: `INV${pad}`,
        department: 'Warehouse',
        email: `inv${i}@shivfurniture.in`,
        password: hashedPassword,
        role: invRole._id,
        status: 'ACTIVE'
      });
    }

    // 4. Create Categories
    console.log(`Creating Categories...`);
    const catFG = await Category.create({ organizationId: org._id, name: 'Finished Goods', description: 'Completed furniture ready for dispatch' });
    const catWood = await Category.create({ organizationId: org._id, name: 'Wood', description: 'Timber, planks, and raw wood panels' });
    const catHardware = await Category.create({ organizationId: org._id, name: 'Hardware', description: 'Fasteners, screws, and metal fittings' });
    const catFinishing = await Category.create({ organizationId: org._id, name: 'Finishing', description: 'Paints, polish, and varnishes' });
    const catUpholstery = await Category.create({ organizationId: org._id, name: 'Upholstery', description: 'Cushions and fabrics' });

    // 5. Create Vendors / Suppliers
    console.log(`Creating Vendors...`);
    const vendorTimber = await Vendor.create({
      organizationId: org._id,
      name: 'Local Timber Co.',
      email: 'sales@localtimber.in',
      phone: '+91 98765 11111',
      address: { street: 'Timber Market', city: 'Pune', state: 'Maharashtra', country: 'India', zipCode: '411002' },
      status: 'ACTIVE'
    });

    const vendorFasteners = await Vendor.create({
      organizationId: org._id,
      name: 'Fasteners India',
      email: 'orders@fasteners.in',
      phone: '+91 98765 22222',
      address: { street: 'GIDC Industrial Area', city: 'Ahmedabad', state: 'Gujarat', country: 'India', zipCode: '382445' },
      status: 'ACTIVE'
    });

    const vendorUniversal = await Vendor.create({
      organizationId: org._id,
      name: 'Universal Furniture Parts',
      email: 'supply@universalparts.in',
      phone: '+91 98765 33333',
      address: { street: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400069' },
      status: 'ACTIVE'
    });

    // 6. Create Customers
    console.log(`Creating Customers...`);
    const custUrban = await Customer.create({
      organizationId: org._id,
      name: 'Urban Home Decor',
      email: 'purchasing@urbanhome.in',
      phone: '+91 99887 77665',
      address: { street: 'Linking Road, Bandra', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400050' },
      status: 'ACTIVE'
    });

    const custOfficeSpaces = await Customer.create({
      organizationId: org._id,
      name: 'Office Spaces Ltd',
      email: 'neha@officespaces.co.in',
      phone: '+91 98765 54321',
      address: { street: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', country: 'India', zipCode: '411014' },
      status: 'ACTIVE'
    });

    // 7. Create Work Centers
    console.log(`Creating Work Centers...`);
    const wcAssembly = await WorkCenter.create({ organizationId: org._id, name: 'Assembly Station 1', code: 'WC-ASM-01', capacityHoursPerDay: 8 });
    const wcFinishing = await WorkCenter.create({ organizationId: org._id, name: 'Finishing & Polish Booth', code: 'WC-FIN-01', capacityHoursPerDay: 8 });
    const wcPacking = await WorkCenter.create({ organizationId: org._id, name: 'Quality Inspection & Packing', code: 'WC-PKG-01', capacityHoursPerDay: 8 });

    // 8. Create Raw Materials & Components Products
    console.log(`Creating Raw Materials & Components...`);
    const rawMaterials = [
      { idKey: 'RM_WOOD', name: 'Wood Panel', sku: 'RM-WOOD-PNL', category: catWood._id, type: 'Raw Material', unit: 'pcs', costPrice: 400, salesPrice: 0, procurementStrategy: 'MTS', procurementType: 'PURCHASE', defaultVendor: vendorTimber._id, reorderLevel: 50, initialOnHand: 100 },
      { idKey: 'RM_SCREW', name: 'Screws (Pack of 100)', sku: 'RM-SCRW-16', category: catHardware._id, type: 'Raw Material', unit: 'pcs', costPrice: 2, salesPrice: 0, procurementStrategy: 'MTS', procurementType: 'PURCHASE', defaultVendor: vendorFasteners._id, reorderLevel: 500, initialOnHand: 2000 },
      { idKey: 'RM_POLISH', name: 'Wood Polish (Litre)', sku: 'RM-POL-WOOD', category: catFinishing._id, type: 'Raw Material', unit: 'L', costPrice: 350, salesPrice: 0, procurementStrategy: 'MTS', procurementType: 'PURCHASE', defaultVendor: vendorUniversal._id, reorderLevel: 20, initialOnHand: 50 },
      { idKey: 'CMP_LEG', name: 'Table Leg', sku: 'CMP-TBL-LEG', category: catWood._id, type: 'Component', unit: 'pcs', costPrice: 150, salesPrice: 0, procurementStrategy: 'MTS', procurementType: 'PURCHASE', defaultVendor: vendorTimber._id, reorderLevel: 40, initialOnHand: 120 },
      { idKey: 'CMP_FRAME', name: 'Metal Frame', sku: 'CMP-MTL-FRM', category: catHardware._id, type: 'Component', unit: 'pcs', costPrice: 800, salesPrice: 0, procurementStrategy: 'MTS', procurementType: 'PURCHASE', defaultVendor: vendorFasteners._id, reorderLevel: 20, initialOnHand: 40 },
      { idKey: 'CMP_CUSHION', name: 'Chair Cushion', sku: 'CMP-CHR-CSH', category: catUpholstery._id, type: 'Component', unit: 'pcs', costPrice: 250, salesPrice: 0, procurementStrategy: 'MTS', procurementType: 'PURCHASE', defaultVendor: vendorUniversal._id, reorderLevel: 30, initialOnHand: 60 }
    ];

    const prodMap = {};

    for (const rm of rawMaterials) {
      console.log(`Creating product: ${rm.name} with SKU: ${rm.sku}`);
      const prod = await Product.create({
        organizationId: org._id,
        name: rm.name,
        sku: String(rm.sku),
        category: rm.category,
        type: rm.type,
        unit: rm.unit,
        costPrice: rm.costPrice,
        salesPrice: rm.salesPrice,
        procurementStrategy: rm.procurementStrategy,
        procurementType: rm.procurementType,
        defaultVendor: rm.defaultVendor,
        reorderLevel: rm.reorderLevel,
        targetStock: rm.reorderLevel * 3,
        isActive: true
      });

      prodMap[rm.idKey] = prod;

      await InventoryBalance.create({
        organizationId: org._id,
        product: prod._id,
        onHand: rm.initialOnHand,
        reserved: 0,
        incoming: 0
      });

      await StockLedger.create({
        organizationId: org._id,
        product: prod._id,
        eventType: 'PURCHASE_RECEIPT',
        quantityChange: rm.initialOnHand,
        previousOnHand: 0,
        newOnHand: rm.initialOnHand,
        referenceType: 'InitialOpeningBalance',
        referenceId: prod._id,
        userId: adminUser._id,
        notes: 'Initial warehouse opening balance'
      });
    }

    // 9. Create Finished Goods Products
    console.log(`Creating Finished Goods Products...`);
    const studyTable = await Product.create({
      organizationId: org._id,
      name: 'Wooden Study Table',
      sku: 'FG-TBL-STUDY',
      category: catFG._id,
      type: 'Finished Good',
      unit: 'units',
      costPrice: 2500,
      salesPrice: 4500,
      procurementStrategy: 'MTS',
      procurementType: 'MANUFACTURING',
      reorderLevel: 10,
      targetStock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&q=80',
      isActive: true
    });
    prodMap['FG_TABLE'] = studyTable;

    const officeChair = await Product.create({
      organizationId: org._id,
      name: 'Office Chair',
      sku: 'FG-CHR-OFFC',
      category: catFG._id,
      type: 'Finished Good',
      unit: 'units',
      costPrice: 1800,
      salesPrice: 3200,
      procurementStrategy: 'MTS',
      procurementType: 'PURCHASE', // Can test purchase procurement
      defaultVendor: vendorUniversal._id,
      reorderLevel: 10,
      targetStock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80',
      isActive: true
    });
    prodMap['FG_CHAIR'] = officeChair;

    // Stock for Finished Goods
    await InventoryBalance.create({
      organizationId: org._id,
      product: studyTable._id,
      onHand: 5,
      reserved: 0,
      incoming: 0
    });
    await StockLedger.create({
      organizationId: org._id,
      product: studyTable._id,
      eventType: 'STOCK_ADJUSTMENT',
      quantityChange: 5,
      previousOnHand: 0,
      newOnHand: 5,
      referenceType: 'InitialOpeningBalance',
      referenceId: studyTable._id,
      userId: adminUser._id,
      notes: 'Initial opening stock balance'
    });

    await InventoryBalance.create({
      organizationId: org._id,
      product: officeChair._id,
      onHand: 2,
      reserved: 0,
      incoming: 0
    });
    await StockLedger.create({
      organizationId: org._id,
      product: officeChair._id,
      eventType: 'STOCK_ADJUSTMENT',
      quantityChange: 2,
      previousOnHand: 0,
      newOnHand: 2,
      referenceType: 'InitialOpeningBalance',
      referenceId: officeChair._id,
      userId: adminUser._id,
      notes: 'Initial opening stock balance'
    });

    // 10. Create BoMs
    console.log(`Creating Bills of Materials (BoM)...`);
    const tableBoM = await BoM.create({
      organizationId: org._id,
      product: studyTable._id,
      name: 'BoM - Wooden Study Table',
      version: '1.0',
      components: [
        { product: prodMap['RM_WOOD']._id, quantity: 2 },
        { product: prodMap['CMP_LEG']._id, quantity: 4 },
        { product: prodMap['RM_SCREW']._id, quantity: 12 },
        { product: prodMap['RM_POLISH']._id, quantity: 1 }
      ],
      operations: [
        { workCenter: wcAssembly._id, name: 'Assembly & Joinery', durationMinutes: 60, sequence: 1 },
        { workCenter: wcFinishing._id, name: 'Sanding & Polish', durationMinutes: 30, sequence: 2 },
        { workCenter: wcPacking._id, name: 'Inspection & Packaging', durationMinutes: 20, sequence: 3 }
      ]
    });
    studyTable.bom = tableBoM._id;
    await studyTable.save();

    // 11. Initial Audit Log
    await AuditLog.create({
      organizationId: org._id,
      action: 'LOGIN',
      module: 'Settings',
      referenceType: 'SystemSeed',
      referenceId: org._id.toString(),
      userId: adminUser._id,
      userEmail: adminUser.email,
      userName: 'Arjun Shiv',
      description: 'System initialized and seeded with Shiv Furniture Works master data'
    });

    console.log(`=======================================================`);
    console.log(`DATABASE SEEDING COMPLETED FOR SHIV FURNITURE WORKS!`);
    console.log(`Organization: ${org.name}`);
    console.log(`Admin Login: ADMIN01 / password123 (or admin@shivfurniture.in)`);
    console.log(`Owner Login: OWNER01 / password123 (or arjun@shivfurniture.in)`);
    console.log(`Sales Login: SALE01 / password123`);
    console.log(`Purchase Login: PUR01 / password123`);
    console.log(`Manufacturing Login: MFG01 / password123`);
    console.log(`Inventory Login: INV01 / password123`);
    console.log(`Products Seeded: 8 (Finished Goods: 2, Raw Materials/Components: 6)`);
    console.log(`BoMs Seeded: 1 (Wooden Study Table)`);
    console.log(`=======================================================`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
