import PurchaseOrder from '../models/PurchaseOrder.js';
import { PurchaseService } from '../services/purchase.service.js';

export const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find({ organizationId: req.organizationId })
      .populate('vendor items.product')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = orders.map(o => ({
      ...o,
      id: o._id,
      supplierName: o.vendor?.name || 'Unknown Supplier',
      supplierId: o.vendor?._id,
      date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '',
      status: o.status === 'RECEIVED' ? 'Received' : o.status === 'SENT' ? 'Sent' : o.status === 'DRAFT' ? 'Draft' : o.status
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findOne({ _id: req.params.id, organizationId: req.organizationId })
      .populate('vendor items.product');

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Purchase order not found' } });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, vendor, items, salesOrderId, expectedDate, expectedArrivalDate, notes } = req.body;
    const vendorId = supplierId || vendor;

    if (!vendorId) {
      return res.status(400).json({ success: false, error: { message: 'Vendor / Supplier ID is required' } });
    }

    const formattedItems = (items || []).map(it => ({
      product: it.productId || it.product,
      quantity: Number(it.quantity) || 1,
      unitPrice: it.unitPrice
    }));

    const order = await PurchaseService.createOrder({
      organizationId: req.organizationId,
      vendor: vendorId,
      items: formattedItems,
      salesOrderId,
      expectedArrivalDate: expectedArrivalDate || expectedDate,
      notes,
      user: req.user
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const confirmPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseService.confirmOrder({
      organizationId: req.organizationId,
      orderId: req.params.id,
      user: req.user
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const receivePurchaseOrder = async (req, res) => {
  try {
    const { itemsToReceive } = req.body;
    const order = await PurchaseService.receiveGoods({
      organizationId: req.organizationId,
      orderId: req.params.id,
      itemsToReceive,
      user: req.user
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
