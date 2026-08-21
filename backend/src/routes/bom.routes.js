import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import {
  getBoMs,
  getBoMById,
  createBoM,
  calculateRequirements
} from '../controllers/bom.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(requirePermission('bom.view'), getBoMs)
  .post(requirePermission('bom.create'), createBoM);

router.post('/calculate-requirements', requirePermission('bom.view'), calculateRequirements);

router.route('/:id')
  .get(requirePermission('bom.view'), getBoMById);

export default router;
