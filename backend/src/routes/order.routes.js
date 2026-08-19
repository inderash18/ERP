import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne } from '../utils/factory.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import ManufacturingOrder from '../models/ManufacturingOrder.js';

const router = express.Router();

router.use(protect);

// Factory function to quickly scaffold basic CRUD for orders
const createOrderRoutes = (path, Model, resourceName) => {
  router.route(`${path}`)
    .get(requirePermission(`${resourceName}.view`), getAll(Model))
    .post(requirePermission(`${resourceName}.create`), createOne(Model));

  router.route(`${path}/:id`)
    .get(requirePermission(`${resourceName}.view`), getOne(Model))
    .put(requirePermission(`${resourceName}.update`), updateOne(Model));
};

createOrderRoutes('/sales', SalesOrder, 'sales_order');
createOrderRoutes('/purchase', PurchaseOrder, 'purchase_order');
createOrderRoutes('/manufacturing', ManufacturingOrder, 'manufacturing_order');

export default router;
