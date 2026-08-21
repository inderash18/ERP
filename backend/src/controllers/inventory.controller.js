import { InventoryService } from '../services/inventory.service.js';
import StockLedger from '../models/StockLedger.js';
import InventoryBalance from '../models/InventoryBalance.js';

export const getBalances = async (req, res) => {
  try {
    const balances = await InventoryBalance.find({ organizationId: req.organizationId }).populate('product');
    res.json({ success: true, count: balances.length, data: balances });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const data = await InventoryService.getAvailability(req.organizationId, req.params.productId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getLedger = async (req, res) => {
  try {
    const ledger = await StockLedger.find({
      organizationId: req.organizationId,
      product: req.params.productId
    }).sort({ createdAt: -1 }).populate('userId', 'firstName lastName email');
    res.json({ success: true, count: ledger.length, data: ledger });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getMovements = async (req, res) => {
  try {
    const movements = await StockLedger.find({ organizationId: req.organizationId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('product userId');

    const formatted = movements.map(m => ({
      id: m._id,
      productId: m.product?._id,
      productName: m.product?.name || 'Unknown Product',
      type: m.eventType,
      quantity: m.quantityChange,
      referenceType: m.referenceType,
      referenceId: m.referenceId,
      date: m.createdAt ? new Date(m.createdAt).toISOString() : '',
      user: m.userId ? `${m.userId.firstName || ''} ${m.userId.lastName || ''}`.trim() || m.userId.email : 'System'
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { productId, newQuantity, delta, notes } = req.body;
    let targetQuantity = newQuantity;

    if (targetQuantity === undefined && delta !== undefined) {
      const current = await InventoryService.getAvailability(req.organizationId, productId);
      targetQuantity = Math.max(0, current.onHand + Number(delta));
    }

    const result = await InventoryService.adjust({
      organizationId: req.organizationId,
      productId,
      newQuantity: Number(targetQuantity) || 0,
      userId: req.user._id,
      notes
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
