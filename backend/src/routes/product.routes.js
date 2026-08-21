import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(requirePermission('product.view'), getProducts)
  .post(requirePermission('product.create'), createProduct);

router.route('/:id')
  .get(requirePermission('product.view'), getProductById)
  .put(requirePermission('product.update'), updateProduct)
  .delete(requirePermission('product.delete'), deleteProduct);

export default router;
