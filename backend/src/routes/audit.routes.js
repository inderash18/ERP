import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import { getAuditLogs } from '../controllers/audit.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', requirePermission('inventory.view'), getAuditLogs);

export default router;
