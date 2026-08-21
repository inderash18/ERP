import ManufacturingOrder from '../models/ManufacturingOrder.js';
import { ManufacturingService } from '../services/manufacturing.service.js';

export const getManufacturingOrders = async (req, res) => {
  try {
    const orders = await ManufacturingOrder.find({ organizationId: req.organizationId })
      .populate('product bom components.product')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = orders.map(m => ({
      ...m,
      id: m._id,
      productId: m.product?._id,
      productName: m.product?.name || 'Unknown Product',
      targetQty: m.quantityToProduce,
      unit: m.product?.unit || 'pcs',
      status: m.status === 'COMPLETED' ? 'Completed' : m.status === 'IN_PROGRESS' ? 'In Progress' : 'Queued',
      startedAt: m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : '',
      targetDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : ''
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getManufacturingOrderById = async (req, res) => {
  try {
    const order = await ManufacturingOrder.findOne({ _id: req.params.id, organizationId: req.organizationId })
      .populate('product bom components.product');

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Manufacturing order not found' } });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const createManufacturingOrder = async (req, res) => {
  try {
    const { productId, product, quantityToProduce, targetQty, line, targetDate, notes } = req.body;
    const prodId = productId || product;

    if (!prodId) {
      return res.status(400).json({ success: false, error: { message: 'Product ID is required' } });
    }

    const order = await ManufacturingService.createOrder({
      organizationId: req.organizationId,
      productId: prodId,
      quantityToProduce: Number(quantityToProduce || targetQty) || 1,
      line,
      targetDate,
      notes,
      user: req.user
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const updateWorkOrder = async (req, res) => {
  try {
    const { workOrderId, status, progress } = req.body;
    const order = await ManufacturingService.updateWorkOrder({
      organizationId: req.organizationId,
      orderId: req.params.id,
      workOrderId,
      status,
      progress,
      user: req.user
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const completeManufacturingOrder = async (req, res) => {
  try {
    const order = await ManufacturingService.completeOrder({
      organizationId: req.organizationId,
      orderId: req.params.id,
      user: req.user
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const deleteManufacturingOrder = async (req, res) => {
  try {
    const order = await ManufacturingOrder.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Manufacturing order not found' } });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
