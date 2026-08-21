import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder
} from '../controllers/purchase.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(requirePermission('purchase.view'), getPurchaseOrders)
  .post(requirePermission('purchase.create'), createPurchaseOrder);

router.route('/:id')
  .get(requirePermission('purchase.view'), getPurchaseOrderById);

router.post('/:id/confirm', requirePermission('purchase.edit'), confirmPurchaseOrder);
router.post('/:id/receive', requirePermission('purchase.edit'), receivePurchaseOrder);

export default router;
