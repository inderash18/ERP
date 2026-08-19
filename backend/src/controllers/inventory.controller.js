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
    }).sort({ createdAt: -1 }).populate('userId', 'firstName lastName');
    res.json({ success: true, count: ledger.length, data: ledger });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { productId, newQuantity, notes } = req.body;
    const result = await InventoryService.adjust({
      organizationId: req.organizationId,
      productId,
      newQuantity,
      userId: req.user._id,
      notes
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
