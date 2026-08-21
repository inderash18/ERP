import SalesOrder from '../models/SalesOrder.js';
import { SalesService } from '../services/sales.service.js';

export const getSalesOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find({ organizationId: req.organizationId })
      .populate('customer items.product')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = orders.map(o => ({
      ...o,
      id: o._id,
      customerName: o.customer?.name || 'Unknown Client',
      date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '',
      fulfillmentStatus: o.status === 'DELIVERED' ? 'Fulfilled' : o.status === 'CONFIRMED' ? 'Ready for Delivery' : o.status === 'PROCESSING_MTO' ? 'Processing (MTO)' : o.status
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getSalesOrderById = async (req, res) => {
  try {
    const order = await SalesOrder.findOne({ _id: req.params.id, organizationId: req.organizationId })
      .populate('customer items.product');

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Sales order not found' } });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const createSalesOrder = async (req, res) => {
  try {
    const { customerId, customer, items, expectedDeliveryDate, shippingAddress, notes } = req.body;
    const custId = customerId || customer;

    if (!custId) {
      return res.status(400).json({ success: false, error: { message: 'Customer ID is required' } });
    }

    // Format items if passed from UI
    const formattedItems = (items || []).map(it => ({
      product: it.productId || it.product,
      quantity: Number(it.quantity) || 1,
      unitPrice: it.unitPrice
    }));

    const order = await SalesService.createOrder({
      organizationId: req.organizationId,
      customer: custId,
      items: formattedItems,
      expectedDeliveryDate,
      shippingAddress,
      notes,
      user: req.user
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const confirmSalesOrder = async (req, res) => {
  try {
    const result = await SalesService.confirmOrder({
      organizationId: req.organizationId,
      orderId: req.params.id,
      user: req.user
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const deliverSalesOrder = async (req, res) => {
  try {
    const order = await SalesService.deliverOrder({
      organizationId: req.organizationId,
      orderId: req.params.id,
      user: req.user
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const cancelSalesOrder = async (req, res) => {
  try {
    const order = await SalesService.cancelOrder({
      organizationId: req.organizationId,
      orderId: req.params.id,
      user: req.user
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
