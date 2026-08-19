import express from 'express';
import { protect, requirePermission } from '../middleware/auth.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/factory.js';

import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Vendor from '../models/Vendor.js';
import BoM from '../models/BoM.js';
import WorkCenter from '../models/WorkCenter.js';

const router = express.Router();

// Require all master data routes to be authenticated
router.use(protect);

// Factory Route Generator to reduce boilerplate
const createCrudRoutes = (path, Model, resourceName) => {
  // e.g. resourceName = 'product'
  router.route(`${path}`)
    .get(requirePermission(`${resourceName}.view`), getAll(Model))
    .post(requirePermission(`${resourceName}.create`), createOne(Model));

  router.route(`${path}/:id`)
    .get(requirePermission(`${resourceName}.view`), getOne(Model))
    .put(requirePermission(`${resourceName}.update`), updateOne(Model))
    .delete(requirePermission(`${resourceName}.delete`), deleteOne(Model));
};

createCrudRoutes('/categories', Category, 'category');
createCrudRoutes('/products', Product, 'product');
createCrudRoutes('/customers', Customer, 'customer');
createCrudRoutes('/vendors', Vendor, 'vendor');
createCrudRoutes('/boms', BoM, 'bom');
createCrudRoutes('/workcenters', WorkCenter, 'workcenter');

export default router;
