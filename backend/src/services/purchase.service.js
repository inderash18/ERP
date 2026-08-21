import PurchaseOrder from '../models/PurchaseOrder.js';
import SalesOrder from '../models/SalesOrder.js';
import Product from '../models/Product.js';
import { InventoryService } from './inventory.service.js';
import { AuditService } from './audit.service.js';

export const PurchaseService = {
  /**
   * Create Purchase Order
   */
  async createOrder(params) {
    const { organizationId, vendor, items, salesOrderId = null, expectedArrivalDate, notes, user } = params;

    if (!items || items.length === 0) {
      throw new Error('Purchase order must contain at least one line item');
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
      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (product.costPrice || 0);
      const lineTotal = qty * unitPrice;
      totalAmount += lineTotal;

      validatedItems.push({
        product: product._id,
        quantity: qty,
        receivedQuantity: 0,
        unitPrice,
        totalPrice: lineTotal
      });
    }

    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PO-${year}-${randomSeq}`;

    const order = await PurchaseOrder.create({
      organizationId,
      orderNumber,
      vendor,
      salesOrderId,
      items: validatedItems,
      totalAmount,
      status: 'DRAFT',
      expectedArrivalDate,
      notes
    });

    await AuditService.log({
      organizationId,
      action: 'PURCHASE_CREATED',
      module: 'Purchase',
      referenceType: 'PurchaseOrder',
      referenceId: order._id.toString(),
      user,
      description: `Created Purchase Order #${orderNumber} for total amount ${totalAmount}`
    });

    return order;
  },

  /**
   * Confirm Purchase Order
   */
  async confirmOrder(params) {
    const { organizationId, orderId, user } = params;

    const order = await PurchaseOrder.findOne({ _id: orderId, organizationId }).populate('vendor items.product');
    if (!order) {
      throw new Error('Purchase order not found');
    }

    if (order.status !== 'DRAFT') {
      throw new Error(`Cannot confirm order in ${order.status} status`);
    }

    order.status = 'SENT';
    await order.save();

    await AuditService.log({
      organizationId,
      action: 'PURCHASE_CONFIRMED',
      module: 'Purchase',
      referenceType: 'PurchaseOrder',
      referenceId: order._id.toString(),
      user,
      description: `Confirmed Purchase Order #${order.orderNumber} sent to vendor`
    });

    return order;
  },

  /**
   * Receive goods on Purchase Order -> Increase physical stock -> Update Stock Ledger -> Mark RECEIVED
   * Idempotent: rejects duplicate receipts exceeding pending ordered quantity.
   */
  async receiveGoods(params) {
    const { organizationId, orderId, itemsToReceive = null, user } = params;

    const order = await PurchaseOrder.findOne({ _id: orderId, organizationId }).populate('items.product vendor');
    if (!order) {
      throw new Error('Purchase order not found');
    }

    if (['RECEIVED', 'CANCELLED'].includes(order.status)) {
      throw new Error(`Cannot receive goods on order in ${order.status} status`);
    }

    let allItemsFullyReceived = true;
    let totalReceivedThisBatch = 0;

    for (const item of order.items) {
      const productId = item.product._id || item.product;
      const alreadyReceived = item.receivedQuantity || 0;
      const totalOrdered = item.quantity;
      const pending = totalOrdered - alreadyReceived;

      if (pending <= 0) continue;

      let qtyToReceive = pending;
      if (itemsToReceive && itemsToReceive[productId.toString()] !== undefined) {
        qtyToReceive = Number(itemsToReceive[productId.toString()]);
      }

      if (qtyToReceive > pending) {
        throw new Error(`Cannot receive ${qtyToReceive} units. Maximum remaining to receive is ${pending}`);
      }

      if (qtyToReceive > 0) {
        await InventoryService.increase({
          organizationId,
          productId,
          quantity: qtyToReceive,
          eventType: 'PURCHASE_RECEIPT',
          referenceType: 'PurchaseOrder',
          referenceId: order._id.toString(),
          userId: user?._id,
          notes: `Goods receipt for Purchase Order #${order.orderNumber}`
        });

        item.receivedQuantity = alreadyReceived + qtyToReceive;
        totalReceivedThisBatch += qtyToReceive;

        // If this PO was linked to a Sales Order (MTO Purchase), reserve the received stock for the Sales Order
        if (order.salesOrderId) {
          const salesOrder = await SalesOrder.findOne({ _id: order.salesOrderId, organizationId });
          if (salesOrder && salesOrder.status !== 'DELIVERED' && salesOrder.status !== 'CANCELLED') {
            await InventoryService.reserve({
              organizationId,
              productId,
              quantity: qtyToReceive,
              referenceType: 'SalesOrder',
              referenceId: salesOrder._id.toString(),
              userId: user?._id
            });
            salesOrder.status = 'READY_FOR_DELIVERY';
            await salesOrder.save();
          }
        }
      }

      if (item.receivedQuantity < item.quantity) {
        allItemsFullyReceived = false;
      }
    }

    order.status = allItemsFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
    await order.save();

    await AuditService.log({
      organizationId,
      action: 'PURCHASE_RECEIVED',
      module: 'Purchase',
      referenceType: 'PurchaseOrder',
      referenceId: order._id.toString(),
      user,
      description: `Received goods for Purchase Order #${order.orderNumber}. Status: ${order.status}`
    });

    return order;
  }
};
