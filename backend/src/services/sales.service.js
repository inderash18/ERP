import SalesOrder from '../models/SalesOrder.js';
import Product from '../models/Product.js';
import InventoryReservation from '../models/InventoryReservation.js';
import { InventoryService } from './inventory.service.js';
import { ProcurementService } from './procurement.service.js';
import { AuditService } from './audit.service.js';

export const SalesService = {
  /**
   * Create a new Sales Order in DRAFT status
   */
  async createOrder(params) {
    const { organizationId, customer, items, expectedDeliveryDate, shippingAddress, notes, user } = params;

    if (!items || items.length === 0) {
      throw new Error('Sales order must contain at least one line item');
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, organizationId });
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      const qty = Number(item.quantity);
      if (qty <= 0) {
        throw new Error(`Invalid item quantity: ${qty}`);
      }
      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (product.salesPrice || 0);
      const lineTotal = qty * unitPrice;
      totalAmount += lineTotal;

      validatedItems.push({
        product: product._id,
        quantity: qty,
        deliveredQuantity: 0,
        unitPrice,
        totalPrice: lineTotal
      });
    }

    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SO-${year}-${randomSeq}`;

    const order = await SalesOrder.create({
      organizationId,
      orderNumber,
      customer,
      items: validatedItems,
      totalAmount,
      status: 'DRAFT',
      expectedDeliveryDate,
      shippingAddress,
      notes
    });

    await AuditService.log({
      organizationId,
      action: 'SALES_ORDER_CREATED',
      module: 'Sales',
      referenceType: 'SalesOrder',
      referenceId: order._id.toString(),
      user,
      description: `Created Sales Order #${orderNumber} for total amount ${totalAmount}`
    });

    return order;
  },

  /**
   * Confirm Sales Order -> Check inventory -> Reserve stock -> Trigger MTO procurement if shortage exists
   */
  async confirmOrder(params) {
    const { organizationId, orderId, user } = params;

    const order = await SalesOrder.findOne({ _id: orderId, organizationId }).populate('items.product customer');
    if (!order) {
      throw new Error('Sales order not found');
    }

    if (order.status !== 'DRAFT') {
      throw new Error(`Cannot confirm order in ${order.status} status`);
    }

    let hasAnyShortage = false;
    const procurementResults = [];

    for (const item of order.items) {
      const productId = item.product._id || item.product;
      const requestedQty = item.quantity;

      const availability = await InventoryService.getAvailability(organizationId, productId);
      const availableQty = availability.available;

      if (availableQty >= requestedQty) {
        // MTS: Sufficient stock -> Reserve the requested quantity
        await InventoryService.reserve({
          organizationId,
          productId,
          quantity: requestedQty,
          referenceType: 'SalesOrder',
          referenceId: order._id.toString(),
          userId: user?._id
        });
      } else {
        // MTO / Shortage Scenario
        hasAnyShortage = true;
        
        // Reserve whatever stock is currently available
        if (availableQty > 0) {
          await InventoryService.reserve({
            organizationId,
            productId,
            quantity: availableQty,
            referenceType: 'SalesOrder',
            referenceId: order._id.toString(),
            userId: user?._id
          });
        }

        const shortage = requestedQty - Math.max(0, availableQty);
        
        // Trigger automated procurement
        const procResult = await ProcurementService.evaluateDemand({
          organizationId,
          productId,
          quantityNeeded: shortage,
          referenceType: 'SalesOrder',
          referenceId: order._id.toString(),
          user
        });
        procurementResults.push(procResult);
      }
    }

    order.status = hasAnyShortage ? 'PROCESSING_MTO' : 'CONFIRMED';
    await order.save();

    await AuditService.log({
      organizationId,
      action: 'SALES_ORDER_CONFIRMED',
      module: 'Sales',
      referenceType: 'SalesOrder',
      referenceId: order._id.toString(),
      user,
      description: `Confirmed Sales Order #${order.orderNumber}. Status: ${order.status} (${hasAnyShortage ? 'Procurement triggered' : 'Stock reserved'})`
    });

    return { order, hasAnyShortage, procurementResults };
  },

  /**
   * Deliver Sales Order -> Decrease physical stock -> Update Stock Ledger -> Mark DELIVERED
   */
  async deliverOrder(params) {
    const { organizationId, orderId, user } = params;

    const order = await SalesOrder.findOne({ _id: orderId, organizationId }).populate('items.product customer');
    if (!order) {
      throw new Error('Sales order not found');
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new Error(`Cannot deliver order in ${order.status} status`);
    }

    // Verify all line items can be fulfilled
    for (const item of order.items) {
      const productId = item.product._id || item.product;
      const availability = await InventoryService.getAvailability(organizationId, productId);
      const remainingToDeliver = item.quantity - (item.deliveredQuantity || 0);

      if (availability.onHand < remainingToDeliver) {
        throw new Error(`Insufficient physical on-hand stock for product ${item.product.name || productId}. On-hand: ${availability.onHand}, Required: ${remainingToDeliver}`);
      }
    }

    // Release reservations and execute stock delivery
    for (const item of order.items) {
      const productId = item.product._id || item.product;
      const remainingToDeliver = item.quantity - (item.deliveredQuantity || 0);

      if (remainingToDeliver > 0) {
        // Find and fulfill any active reservations for this sales order item
        const reservations = await InventoryReservation.find({
          organizationId,
          product: productId,
          referenceType: 'SalesOrder',
          referenceId: order._id.toString(),
          status: 'ACTIVE'
        });

        for (const res of reservations) {
          await InventoryService.release({
            organizationId,
            reservationId: res._id,
            userId: user?._id,
            isFulfillment: true
          });
        }

        // Deduct physical inventory
        await InventoryService.decrease({
          organizationId,
          productId,
          quantity: remainingToDeliver,
          eventType: 'SALES_DELIVERY',
          referenceType: 'SalesOrder',
          referenceId: order._id.toString(),
          userId: user?._id,
          notes: `Delivery for Sales Order #${order.orderNumber}`
        });

        item.deliveredQuantity = item.quantity;
      }
    }

    order.status = 'DELIVERED';
    order.paymentStatus = 'PAID';
    await order.save();

    await AuditService.log({
      organizationId,
      action: 'SALES_ORDER_DELIVERED',
      module: 'Sales',
      referenceType: 'SalesOrder',
      referenceId: order._id.toString(),
      user,
      description: `Fulfilled and delivered Sales Order #${order.orderNumber}. Stock deducted and ledger updated.`
    });

    return order;
  },

  /**
   * Cancel Sales Order -> Release active stock reservations
   */
  async cancelOrder(params) {
    const { organizationId, orderId, user } = params;

    const order = await SalesOrder.findOne({ _id: orderId, organizationId });
    if (!order) {
      throw new Error('Sales order not found');
    }

    if (order.status === 'DELIVERED') {
      throw new Error('Cannot cancel an already delivered sales order');
    }

    // Release any active reservations
    const reservations = await InventoryReservation.find({
      organizationId,
      referenceType: 'SalesOrder',
      referenceId: order._id.toString(),
      status: 'ACTIVE'
    });

    for (const res of reservations) {
      await InventoryService.release({
        organizationId,
        reservationId: res._id,
        userId: user?._id,
        isFulfillment: false
      });
    }

    order.status = 'CANCELLED';
    await order.save();

    await AuditService.log({
      organizationId,
      action: 'SALES_ORDER_CANCELLED',
      module: 'Sales',
      referenceType: 'SalesOrder',
      referenceId: order._id.toString(),
      user,
      description: `Cancelled Sales Order #${order.orderNumber}. Released reservations.`
    });

    return order;
  }
};
