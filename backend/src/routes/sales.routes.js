import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  confirmSalesOrder,
  deliverSalesOrder,
  cancelSalesOrder
} from '../controllers/sales.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(requirePermission('sales.view'), getSalesOrders)
  .post(requirePermission('sales.create'), createSalesOrder);

router.route('/:id')
  .get(requirePermission('sales.view'), getSalesOrderById)
  .delete(requirePermission('sales.delete'), cancelSalesOrder);

router.post('/:id/confirm', requirePermission('sales.edit'), confirmSalesOrder);
router.post('/:id/deliver', requirePermission('sales.edit'), deliverSalesOrder);
router.post('/:id/fulfill', requirePermission('sales.edit'), deliverSalesOrder);
router.post('/:id/cancel', requirePermission('sales.edit'), cancelSalesOrder);

export default router;
