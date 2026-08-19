import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import { getBalances, getAvailability, getLedger, adjustStock } from '../controllers/inventory.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', requirePermission('inventory.view'), getBalances);
router.get('/:productId/availability', requirePermission('inventory.view'), getAvailability);
router.get('/:productId/ledger', requirePermission('inventory.view'), getLedger);
router.post('/adjust', requirePermission('inventory.adjust'), adjustStock);

export default router;
