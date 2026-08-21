import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import { getUsers, createUser, updateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(requirePermission('*'), createUser);

router.route('/:id')
  .put(requirePermission('*'), updateUser);

export default router;
