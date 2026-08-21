import 'dotenv/config';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import Organization from './models/Organization.js';
import Role from './models/Role.js';
import User from './models/User.js';
import Category from './models/Category.js';
import Vendor from './models/Vendor.js';
import Customer from './models/Customer.js';
import Product from './models/Product.js';
import InventoryBalance from './models/InventoryBalance.js';
import StockLedger from './models/StockLedger.js';
import SalesOrder from './models/SalesOrder.js';
import ManufacturingOrder from './models/ManufacturingOrder.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-erp';

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB...`);
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
      InventoryBalance.deleteMany({}),
      StockLedger.deleteMany({}),
      SalesOrder.deleteMany({}),
      ManufacturingOrder.deleteMany({}),
    ]);
    console.log(`Existing collections cleaned.`);

    // 1. Create Organization
    console.log(`Creating Organization...`);
    const org = await Organization.create({
      name: 'Mini-ERP Industrial Solutions Pvt Ltd',
      domain: 'minierp-solutions.com',
      status: 'ACTIVE',
      settings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      }
    });

    // 2. Create Roles
    console.log(`Creating Roles...`);
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

    const opsRole = await Role.create({
      organizationId: org._id,
      name: 'OPERATIONS',
      permissions: ['inventory.*', 'manufacturing.*', 'product.*'],
      isSystem: false
    });

    // 3. Create Users
    console.log(`Creating Users...`);
    const adminUser = await User.create({
      organizationId: org._id,
      firstName: 'Alexander',
      lastName: 'Reed',
      email: 'admin@minierp.io',
      password: 'password123',
      role: adminRole._id,
      status: 'ACTIVE'
    });

    const salesUser = await User.create({
      organizationId: org._id,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      email: 'sales@minierp.io',
      password: 'password123',
      role: salesRole._id,
      status: 'ACTIVE'
    });

    // 4. Create Categories
    console.log(`Creating Categories...`);
    const catRaw = await Category.create({
      organizationId: org._id,
      name: 'Raw Material',
      description: 'Primary raw feedstock materials for production'
    });

    const catComponents = await Category.create({
      organizationId: org._id,
      name: 'Components',
      description: 'Precision manufactured components and sub-assemblies'
    });

    const catHardware = await Category.create({
      organizationId: org._id,
      name: 'Hardware',
      description: 'Industrial fasteners, bolts, and mechanical fittings'
    });

    const catFinished = await Category.create({
      organizationId: org._id,
      name: 'Finished Goods',
      description: 'Completed products ready for customer dispatch'
    });

    // 5. Create Vendors
    console.log(`Creating Vendors...`);
    const vendorTata = await Vendor.create({
      organizationId: org._id,
      name: 'Tata Advanced Materials Ltd',
      email: 'sales@tatamaterials.com',
      phone: '+91 22 6665 8282',
      address: {
        street: 'Bombay House, 24 Homi Mody Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001'
      },
      status: 'ACTIVE'
    });

    const vendorBosch = await Vendor.create({
      organizationId: org._id,
      name: 'Bosch Rexroth Hydraulics',
      email: 'orders@boschrexroth.co.in',
      phone: '+91 80 6757 1000',
      address: {
        street: 'Hosur Road, Adugodi',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        zipCode: '560030'
      },
      status: 'ACTIVE'
    });

    // 6. Create Customers
    console.log(`Creating Customers...`);
    const custApex = await Customer.create({
      organizationId: org._id,
      name: 'Apex Industrial Corp',
      email: 'procurement@apexcorp.in',
      phone: '+91 98234 11200',
      address: {
        street: 'Plot 45, MIDC Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400093'
      },
      status: 'ACTIVE'
    });

    const custNexus = await Customer.create({
      organizationId: org._id,
      name: 'Nexus Logistics Ltd',
      email: 'contact@nexuslogistics.com',
      phone: '+91 97120 54321',
      address: {
        street: 'Sector 18, Viman Nagar',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411014'
      },
      status: 'ACTIVE'
    });

    const custZenith = await Customer.create({
      organizationId: org._id,
      name: 'Zenith Automotive Systems',
      email: 'karan@zenithauto.io',
      phone: '+91 98980 99881',
      address: {
        street: 'GIDC Sanand Phase II',
        city: 'Ahmedabad',
        state: 'Gujarat',
        country: 'India',
        zipCode: '382110'
      },
      status: 'ACTIVE'
    });

    const custBeacon = await Customer.create({
      organizationId: org._id,
      name: 'Beacon Energy Solutions',
      email: 'priya@beaconenergy.org',
      phone: '+91 94470 33211',
      address: {
        street: 'Electronic City Phase 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        zipCode: '560100'
      },
      status: 'ACTIVE'
    });

    // 7. Create Products & Inventory Balances
    console.log(`Creating Products & Stock Balances...`);
    const productData = [
      {
        name: 'Aluminum Extrusion Bar (6063-T6)',
        sku: 'SKU-9021',
        category: catRaw._id,
        salesPrice: 350,
        costPrice: 280,
        procurementStrategy: 'MTS',
        procurementType: 'PURCHASE',
        defaultVendor: vendorTata._id,
        reorderLevel: 100,
        onHand: 450,
        reserved: 50,
        incoming: 200
      },
      {
        name: 'Precision Roller Bearing 25mm',
        sku: 'SKU-8842',
        category: catComponents._id,
        salesPrice: 220,
        costPrice: 150,
        procurementStrategy: 'MTS',
        procurementType: 'PURCHASE',
        defaultVendor: vendorBosch._id,
        reorderLevel: 300,
        onHand: 1240,
        reserved: 200,
        incoming: 500
      },
      {
        name: 'High-Tensile Hex Bolt M8x40',
        sku: 'SKU-7721',
        category: catHardware._id,
        salesPrice: 650,
        costPrice: 450,
        procurementStrategy: 'MTS',
        procurementType: 'PURCHASE',
        defaultVendor: vendorTata._id,
        reorderLevel: 200,
        onHand: 85, // Low stock
        reserved: 30,
        incoming: 300
      },
      {
        name: 'Hydraulic Fluid Type IV (20L)',
        sku: 'SKU-6519',
        category: catRaw._id,
        salesPrice: 4200,
        costPrice: 3200,
        procurementStrategy: 'MTS',
        procurementType: 'PURCHASE',
        defaultVendor: vendorBosch._id,
        reorderLevel: 15,
        onHand: 18,
        reserved: 5,
        incoming: 40
      },
      {
        name: 'Tempered Glass Panel 600x800',
        sku: 'SKU-5402',
        category: catFinished._id,
        salesPrice: 2450,
        costPrice: 1850,
        procurementStrategy: 'MTS',
        procurementType: 'MANUFACTURING',
        reorderLevel: 50,
        onHand: 320,
        reserved: 60,
        incoming: 500
      },
      {
        name: 'Heavy Duty Servo Motor 400W',
        sku: 'SKU-4310',
        category: catComponents._id,
        salesPrice: 11200,
        costPrice: 8500,
        procurementStrategy: 'MTO',
        procurementType: 'PURCHASE',
        defaultVendor: vendorBosch._id,
        reorderLevel: 20,
        onHand: 42,
        reserved: 30,
        incoming: 100
      }
    ];

    const createdProducts = [];

    for (const item of productData) {
      const prod = await Product.create({
        organizationId: org._id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        salesPrice: item.salesPrice,
        costPrice: item.costPrice,
        procurementStrategy: item.procurementStrategy,
        procurementType: item.procurementType,
        defaultVendor: item.defaultVendor,
        reorderLevel: item.reorderLevel,
        isActive: true
      });

      await InventoryBalance.create({
        organizationId: org._id,
        product: prod._id,
        onHand: item.onHand,
        reserved: item.reserved,
        incoming: item.incoming
      });

      await StockLedger.create({
        organizationId: org._id,
        product: prod._id,
        eventType: 'PURCHASE_RECEIPT',
        quantityChange: item.onHand,
        previousOnHand: 0,
        newOnHand: item.onHand,
        referenceType: 'MANUAL_ADJUSTMENT',
        referenceId: prod._id,
        userId: adminUser._id,
        notes: 'Initial opening stock ledger balance'
      });

      createdProducts.push({ ...item, _id: prod._id });
    }

    // 8. Create Sales Orders
    console.log(`Creating Sales Orders...`);
    const glassProd = createdProducts.find(p => p.sku === 'SKU-5402');
    const bearingProd = createdProducts.find(p => p.sku === 'SKU-8842');
    const motorProd = createdProducts.find(p => p.sku === 'SKU-4310');

    await SalesOrder.create({
      organizationId: org._id,
      orderNumber: 'SO-2026-0941',
      customer: custApex._id,
      items: [
        { product: glassProd._id, quantity: 60, unitPrice: glassProd.salesPrice, totalPrice: 60 * glassProd.salesPrice },
        { product: bearingProd._id, quantity: 200, unitPrice: bearingProd.salesPrice, totalPrice: 200 * bearingProd.salesPrice }
      ],
      totalAmount: (60 * glassProd.salesPrice) + (200 * bearingProd.salesPrice),
      status: 'CONFIRMED',
      expectedDeliveryDate: new Date('2026-08-25'),
      shippingAddress: 'Plot 45, MIDC Industrial Area, Mumbai, MH'
    });

    await SalesOrder.create({
      organizationId: org._id,
      orderNumber: 'SO-2026-0939',
      customer: custZenith._id,
      items: [
        { product: motorProd._id, quantity: 30, unitPrice: motorProd.salesPrice, totalPrice: 30 * motorProd.salesPrice }
      ],
      totalAmount: 30 * motorProd.salesPrice,
      status: 'PROCESSING',
      expectedDeliveryDate: new Date('2026-08-28'),
      shippingAddress: 'GIDC Sanand Phase II, Ahmedabad, GJ'
    });

    console.log(`===========================================`);
    console.log(`DATABASE SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`Organization: ${org.name}`);
    console.log(`Admin User: admin@minierp.io / password123`);
    console.log(`Products Seeded: ${createdProducts.length}`);
    console.log(`Customers Seeded: 4`);
    console.log(`Vendors Seeded: 2`);
    console.log(`===========================================`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
