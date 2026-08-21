import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import { evaluateDemand } from '../controllers/procurement.controller.js';

const router = express.Router();

router.use(protect);

router.post('/evaluate', requirePermission('purchase.view'), evaluateDemand);

export default router;
