import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import {
  getManufacturingOrders,
  getManufacturingOrderById,
  createManufacturingOrder,
  updateWorkOrder,
  completeManufacturingOrder,
  deleteManufacturingOrder
} from '../controllers/manufacturing.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(requirePermission('manufacturing.view'), getManufacturingOrders)
  .post(requirePermission('manufacturing.create'), createManufacturingOrder);

router.route('/:id')
  .get(requirePermission('manufacturing.view'), getManufacturingOrderById)
  .delete(requirePermission('manufacturing.delete'), deleteManufacturingOrder);

router.post('/:id/work-orders', requirePermission('manufacturing.edit'), updateWorkOrder);
router.post('/:id/progress', requirePermission('manufacturing.edit'), updateWorkOrder);
router.post('/:id/complete', requirePermission('manufacturing.edit'), completeManufacturingOrder);

export default router;
