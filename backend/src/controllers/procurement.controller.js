import { ProcurementService } from '../services/procurement.service.js';

export const evaluateDemand = async (req, res) => {
  try {
    const { productId, quantityNeeded, referenceType, referenceId } = req.body;

    if (!productId || !quantityNeeded) {
      return res.status(400).json({
        success: false,
        error: { message: 'Product ID and quantityNeeded are required' }
      });
    }

    const result = await ProcurementService.evaluateDemand({
      organizationId: req.organizationId,
      productId,
      quantityNeeded: Number(quantityNeeded),
      referenceType,
      referenceId,
      user: req.user
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
