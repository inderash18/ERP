import Product from '../models/Product.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import ManufacturingOrder from '../models/ManufacturingOrder.js';
import BoM from '../models/BoM.js';
import { InventoryService } from './inventory.service.js';
import { AuditService } from './audit.service.js';

export const ProcurementService = {
  /**
   * Evaluates demand, detects shortages, and triggers procurement documents idempotently
   */
  async evaluateDemand(params) {
    const {
      organizationId,
      productId,
      quantityNeeded,
      referenceType = 'SALES_ORDER',
      referenceId = null,
      user = null
    } = params;

    const product = await Product.findOne({ _id: productId, organizationId }).populate('bom defaultVendor');
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const availability = await InventoryService.getAvailability(organizationId, productId);
    const availableStock = availability.available;
    const shortage = Math.max(0, quantityNeeded - availableStock);

    if (shortage === 0) {
      return {
        hasShortage: false,
        shortage: 0,
        strategy: 'MTS',
        documentType: 'NONE',
        document: null
      };
    }

    // Check if an active procurement document already exists for this reference to prevent duplicate orders
    if (referenceId) {
      if (product.procurementType === 'PURCHASE') {
        const existingPO = await PurchaseOrder.findOne({
          organizationId,
          salesOrderId: referenceId,
          'items.product': product._id,
          status: { $ne: 'CANCELLED' }
        });
        if (existingPO) {
          return {
            hasShortage: true,
            shortage,
            strategy: 'MTO',
            documentType: 'PURCHASE_ORDER',
            document: existingPO,
            isExisting: true
          };
        }
      } else if (product.procurementType === 'MANUFACTURING') {
        const existingMO = await ManufacturingOrder.findOne({
          organizationId,
          salesOrderId: referenceId,
          product: product._id,
          status: { $ne: 'CANCELLED' }
        });
        if (existingMO) {
          return {
            hasShortage: true,
            shortage,
            strategy: 'MTO',
            documentType: 'MANUFACTURING_ORDER',
            document: existingMO,
            isExisting: true
          };
        }
      }
    }

    // Shortage detected -> execute MTO procurement document creation
    let createdDoc = null;
    let documentType = 'NONE';

    if (product.procurementType === 'PURCHASE') {
      documentType = 'PURCHASE_ORDER';
      const year = new Date().getFullYear();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `PO-${year}-${randomSeq}`;

      createdDoc = await PurchaseOrder.create({
        organizationId,
        orderNumber,
        salesOrderId: referenceId,
        vendor: product.defaultVendor?._id || product.defaultVendor,
        items: [{
          product: product._id,
          quantity: shortage,
          unitPrice: product.costPrice || 0,
          totalPrice: shortage * (product.costPrice || 0)
        }],
        totalAmount: shortage * (product.costPrice || 0),
        status: 'DRAFT',
        expectedArrivalDate: new Date(Date.now() + 5 * 86400000),
        notes: `Auto-generated MTO Purchase Order for ${referenceType} #${referenceId || 'N/A'}`
      });

      await AuditService.log({
        organizationId,
        action: 'PURCHASE_CREATED',
        module: 'Procurement',
        referenceType: 'PurchaseOrder',
        referenceId: createdDoc._id.toString(),
        user,
        description: `Auto-generated Purchase Order #${orderNumber} for shortage of ${shortage} units of ${product.name}`
      });

    } else if (product.procurementType === 'MANUFACTURING') {
      documentType = 'MANUFACTURING_ORDER';
      const year = new Date().getFullYear();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `MO-${year}-${randomSeq}`;

      // Resolve BoM
      let bom = product.bom;
      if (!bom) {
        bom = await BoM.findOne({ product: product._id, organizationId, isActive: true });
      }

      const components = [];
      const workOrders = [
        { operation: 'Assembly & Joinery', durationMinutes: 60, status: 'PENDING' },
        { operation: 'Finishing & Polish', durationMinutes: 30, status: 'PENDING' },
        { operation: 'Quality Inspection & Packing', durationMinutes: 20, status: 'PENDING' }
      ];

      if (bom && bom.components) {
        for (const comp of bom.components) {
          const reqQty = (comp.quantity || 1) * shortage;
          components.push({
            product: comp.product,
            quantityRequired: reqQty,
            quantityConsumed: 0
          });
        }
      }

      createdDoc = await ManufacturingOrder.create({
        organizationId,
        orderNumber,
        salesOrderId: referenceId,
        product: product._id,
        bom: bom?._id,
        quantityToProduce: shortage,
        quantityProduced: 0,
        components,
        workOrders,
        status: 'PLANNED',
        targetDate: new Date(Date.now() + 3 * 86400000),
        notes: `Auto-generated MTO Manufacturing Order for ${referenceType} #${referenceId || 'N/A'}`
      });

      await AuditService.log({
        organizationId,
        action: 'MO_CREATED',
        module: 'Manufacturing',
        referenceType: 'ManufacturingOrder',
        referenceId: createdDoc._id.toString(),
        user,
        description: `Auto-generated Manufacturing Order #${orderNumber} for shortage of ${shortage} units of ${product.name}`
      });
    }

    return {
      hasShortage: true,
      shortage,
      strategy: 'MTO',
      documentType,
      document: createdDoc
    };
  }
};
