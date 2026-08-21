import mongoose from 'mongoose';
import ManufacturingOrder from '../models/ManufacturingOrder.js';
import Product from '../models/Product.js';
import BoM from '../models/BoM.js';
import InventoryBalance from '../models/InventoryBalance.js';
import StockLedger from '../models/StockLedger.js';
import { InventoryService } from './inventory.service.js';
import { AuditService } from './audit.service.js';

export const ManufacturingService = {
  /**
   * Create Manufacturing Order with BoM explosion
   */
  async createOrder(params) {
    const {
      organizationId,
      productId,
      quantityToProduce,
      salesOrderId = null,
      line = 'Line Alpha (CNC Milling)',
      targetDate = null,
      notes = '',
      user = null
    } = params;

    const product = await Product.findOne({ _id: productId, organizationId }).populate('bom');
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const qty = Number(quantityToProduce);
    if (qty <= 0) {
      throw new Error('Quantity to produce must be greater than zero');
    }

    // Resolve BoM
    let bom = product.bom;
    if (!bom) {
      bom = await BoM.findOne({ product: product._id, organizationId, isActive: true });
    }

    const components = [];
    const workOrders = [];

    if (bom) {
      if (bom.components && bom.components.length > 0) {
        for (const comp of bom.components) {
          components.push({
            product: comp.product,
            quantityRequired: Number(comp.quantity) * qty,
            quantityConsumed: 0
          });
        }
      }

      if (bom.operations && bom.operations.length > 0) {
        for (const op of bom.operations) {
          workOrders.push({
            operation: op.name,
            workCenter: op.workCenter,
            durationMinutes: op.durationMinutes || 30,
            status: 'PENDING'
          });
        }
      }
    }

    // Fallback default work orders if none specified in BoM
    if (workOrders.length === 0) {
      workOrders.push(
        { operation: 'Assembly & Fabrication', durationMinutes: 60, status: 'PENDING' },
        { operation: 'Surface Finishing & Polish', durationMinutes: 30, status: 'PENDING' },
        { operation: 'Quality Inspection & Packing', durationMinutes: 20, status: 'PENDING' }
      );
    }

    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MO-${year}-${randomSeq}`;

    const order = await ManufacturingOrder.create({
      organizationId,
      orderNumber,
      salesOrderId,
      product: product._id,
      bom: bom?._id,
      quantityToProduce: qty,
      quantityProduced: 0,
      line,
      progress: 0,
      components,
      workOrders,
      status: 'PLANNED',
      targetDate: targetDate || new Date(Date.now() + 3 * 86400000),
      notes
    });

    await AuditService.log({
      organizationId,
      action: 'MO_CREATED',
      module: 'Manufacturing',
      referenceType: 'ManufacturingOrder',
      referenceId: order._id.toString(),
      user,
      description: `Created Manufacturing Order #${orderNumber} for ${qty} units of ${product.name}`
    });

    return order;
  },

  /**
   * Update a specific Work Order stage (e.g. Assembly -> Finishing)
   */
  async updateWorkOrder(params) {
    const { organizationId, orderId, workOrderId, status, progress, user } = params;

    const order = await ManufacturingOrder.findOne({ _id: orderId, organizationId });
    if (!order) {
      throw new Error('Manufacturing order not found');
    }

    if (workOrderId) {
      const wo = order.workOrders.id(workOrderId);
      if (wo) {
        if (status) wo.status = status;
        if (status === 'IN_PROGRESS' && !wo.startedAt) wo.startedAt = new Date();
        if (status === 'COMPLETED') wo.completedAt = new Date();
      }
    }

    // Recalculate overall progress
    if (progress !== undefined) {
      order.progress = Math.min(100, Math.max(0, Number(progress)));
    } else {
      const totalWO = order.workOrders.length;
      if (totalWO > 0) {
        const completedWO = order.workOrders.filter(w => w.status === 'COMPLETED').length;
        order.progress = Math.round((completedWO / totalWO) * 100);
      }
    }

    if (order.progress >= 100) {
      order.status = 'COMPLETED';
    } else if (order.progress > 0 || status === 'IN_PROGRESS') {
      order.status = 'IN_PROGRESS';
    }

    await order.save();

    await AuditService.log({
      organizationId,
      action: 'WORK_ORDER_COMPLETED',
      module: 'Manufacturing',
      referenceType: 'ManufacturingOrder',
      referenceId: order._id.toString(),
      user,
      description: `Updated Manufacturing Order #${order.orderNumber} work order progress to ${order.progress}%`
    });

    return order;
  },

  /**
   * Complete Manufacturing Order -> Atomically consume components and produce finished goods
   */
  async completeOrder(params) {
    const { organizationId, orderId, user } = params;

    const order = await ManufacturingOrder.findOne({ _id: orderId, organizationId }).populate('components.product product');
    if (!order) {
      throw new Error('Manufacturing order not found');
    }

    if (order.status === 'COMPLETED') {
      throw new Error('Manufacturing order is already completed');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Verify component inventory availability
      for (const comp of order.components) {
        const compBalance = await InventoryBalance.findOne({
          organizationId,
          product: comp.product._id || comp.product
        }).session(session);

        const needed = comp.quantityRequired;
        if (!compBalance || compBalance.onHand < needed) {
          throw new Error(`Insufficient component stock for ${comp.product.name || 'Component'}. Available: ${compBalance?.onHand || 0}, Required: ${needed}`);
        }
      }

      // 2. Consume components
      for (const comp of order.components) {
        const compId = comp.product._id || comp.product;
        const compBalance = await InventoryBalance.findOne({ organizationId, product: compId }).session(session);

        const previousOnHand = compBalance.onHand;
        compBalance.onHand -= comp.quantityRequired;
        await compBalance.save({ session });

        await StockLedger.create([{
          organizationId,
          product: compId,
          eventType: 'MANUFACTURING_CONSUMPTION',
          quantityChange: -comp.quantityRequired,
          previousOnHand,
          newOnHand: compBalance.onHand,
          referenceType: 'ManufacturingOrder',
          referenceId: order._id.toString(),
          userId: user?._id,
          notes: `Consumed for Manufacturing Order #${order.orderNumber}`
        }], { session });

        comp.quantityConsumed = comp.quantityRequired;
      }

      // 3. Produce Finished Goods
      let fgBalance = await InventoryBalance.findOne({
        organizationId,
        product: order.product._id || order.product
      }).session(session);

      if (!fgBalance) {
        const created = await InventoryBalance.create([{
          organizationId,
          product: order.product._id || order.product
        }], { session });
        fgBalance = created[0];
      }

      const fgPreviousOnHand = fgBalance.onHand;
      fgBalance.onHand += order.quantityToProduce;
      await fgBalance.save({ session });

      await StockLedger.create([{
        organizationId,
        product: order.product._id || order.product,
        eventType: 'MANUFACTURING_PRODUCTION',
        quantityChange: order.quantityToProduce,
        previousOnHand: fgPreviousOnHand,
        newOnHand: fgBalance.onHand,
        referenceType: 'ManufacturingOrder',
        referenceId: order._id.toString(),
        userId: user?._id,
        notes: `Produced from Manufacturing Order #${order.orderNumber}`
      }], { session });

      // 4. Update MO record
      order.quantityProduced = order.quantityToProduce;
      order.progress = 100;
      order.status = 'COMPLETED';
      order.workOrders.forEach(w => {
        w.status = 'COMPLETED';
        if (!w.completedAt) w.completedAt = new Date();
      });

      await order.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    await AuditService.log({
      organizationId,
      action: 'MANUFACTURING_COMPLETED',
      module: 'Manufacturing',
      referenceType: 'ManufacturingOrder',
      referenceId: order._id.toString(),
      user,
      description: `Completed Manufacturing Order #${order.orderNumber}. Produced ${order.quantityToProduce} units of ${order.product.name}.`
    });

    return order;
  }
};
