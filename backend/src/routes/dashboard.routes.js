import express from 'express';
import { protect } from '../middleware/auth.js';
import { getDashboardMetrics } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getDashboardMetrics);
router.get('/metrics', getDashboardMetrics);

export default router;
