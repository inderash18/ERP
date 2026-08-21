import BoM from '../models/BoM.js';
import Product from '../models/Product.js';
import { InventoryService } from '../services/inventory.service.js';

export const getBoMs = async (req, res) => {
  try {
    const boms = await BoM.find({ organizationId: req.organizationId })
      .populate('product components.product operations.workCenter')
      .lean();

    const formatted = boms.map(b => ({
      ...b,
      id: b._id,
      productId: b.product?._id,
      productName: b.product?.name || b.name,
      components: (b.components || []).map(c => ({
        ...c,
        productId: c.product?._id,
        productName: c.product?.name || 'Component',
        unit: c.product?.unit || 'pcs'
      }))
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getBoMById = async (req, res) => {
  try {
    const bom = await BoM.findOne({ _id: req.params.id, organizationId: req.organizationId })
      .populate('product components.product operations.workCenter');

    if (!bom) {
      return res.status(404).json({ success: false, error: { message: 'BoM not found' } });
    }

    res.json({ success: true, data: bom });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const createBoM = async (req, res) => {
  try {
    const { productId, product, name, components, operations, version } = req.body;
    const prodId = (productId || product)?.toString();

    if (!prodId) {
      return res.status(400).json({ success: false, error: { message: 'Product ID is required' } });
    }

    const prod = await Product.findOne({ _id: prodId, organizationId: req.organizationId });
    if (!prod) {
      return res.status(404).json({ success: false, error: { message: 'Target product not found' } });
    }

    if (!components || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'BoM must contain at least one component' } });
    }

    // Circular reference validation: A product cannot use itself as a component
    for (const comp of components) {
      const compId = (comp.productId || comp.product)?.toString();
      if (compId === prodId) {
        return res.status(400).json({
          success: false,
          error: { code: 'CIRCULAR_BOM', message: 'Circular BoM reference detected: Product cannot be a component of itself.' }
        });
      }
    }

    const formattedComponents = components.map(c => ({
      product: c.productId || c.product,
      quantity: Math.max(0.0001, Number(c.quantity) || 1)
    }));

    const bom = await BoM.create({
      organizationId: req.organizationId,
      product: prod._id,
      name: name || `BoM for ${prod.name}`,
      components: formattedComponents,
      operations: operations || [],
      version: version || '1.0',
      isActive: true
    });

    prod.bom = bom._id;
    await prod.save();

    res.status(201).json({ success: true, data: bom });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const calculateRequirements = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);

    if (!productId) {
      return res.status(400).json({ success: false, error: { message: 'Product ID is required' } });
    }
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, error: { message: 'Quantity must be greater than zero' } });
    }

    const targetProduct = await Product.findOne({ _id: productId, organizationId: req.organizationId });
    if (!targetProduct) {
      return res.status(404).json({ success: false, error: { message: 'Product not found' } });
    }

    let bom = await BoM.findOne({ product: productId, organizationId: req.organizationId, isActive: true })
      .populate('components.product');

    if (!bom) {
      return res.status(404).json({ success: false, error: { message: 'No active BoM found for this product' } });
    }

    const materials = [];
    for (const comp of bom.components) {
      const compProd = comp.product || {};
      const required = Number(comp.quantity) * qty;
      const availability = await InventoryService.getAvailability(req.organizationId, compProd._id);
      const available = availability.available;
      const shortage = Math.max(0, required - available);

      materials.push({
        productId: compProd._id,
        productName: compProd.name || 'Component',
        required,
        available,
        shortage,
        status: shortage > 0 ? 'SHORTAGE' : 'AVAILABLE',
        unit: compProd.unit || 'pcs'
      });
    }

    res.json({
      success: true,
      data: {
        productId,
        productName: targetProduct.name,
        quantity: qty,
        materials
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
