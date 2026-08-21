import Product from '../models/Product.js';
import InventoryBalance from '../models/InventoryBalance.js';
import { InventoryService } from '../services/inventory.service.js';
import { AuditService } from '../services/audit.service.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ organizationId: req.organizationId })
      .populate('category defaultVendor bom')
      .lean();

    // Attach real-time inventory balances
    const balances = await InventoryBalance.find({ organizationId: req.organizationId }).lean();
    const balanceMap = {};
    for (const b of balances) {
      balanceMap[b.product.toString()] = b;
    }

    const enriched = products.map(p => {
      const b = balanceMap[p._id.toString()] || { onHand: 0, reserved: 0, incoming: 0 };
      const onHand = b.onHand || 0;
      const reserved = b.reserved || 0;
      const freeToUse = Math.max(0, onHand - reserved);
      const minStock = p.reorderLevel || 10;
      const status = onHand <= minStock ? 'Low Stock' : 'In Stock';

      return {
        ...p,
        id: p._id,
        stock: onHand,
        onHand,
        reserved,
        freeToUse,
        available: freeToUse,
        incoming: b.incoming || 0,
        status,
        purchasePrice: p.costPrice || 0,
        sellingPrice: p.salesPrice || 0
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, organizationId: req.organizationId })
      .populate('category defaultVendor bom');

    if (!product) {
      return res.status(404).json({ success: false, error: { message: 'Product not found' } });
    }

    const availability = await InventoryService.getAvailability(req.organizationId, product._id);

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        id: product._id,
        ...availability,
        freeToUse: availability.available,
        purchasePrice: product.costPrice,
        sellingPrice: product.salesPrice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      salesPrice,
      costPrice,
      purchasePrice,
      sellingPrice,
      type,
      unit,
      imageUrl,
      procurementStrategy,
      procurementType,
      defaultVendor,
      reorderLevel,
      minStock,
      targetStock,
      initialStock
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: { message: 'Product name is required' } });
    }

    const generatedSku = sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const product = await Product.create({
      organizationId: req.organizationId,
      name,
      sku: generatedSku,
      category: category || undefined,
      salesPrice: sellingPrice !== undefined ? sellingPrice : (salesPrice || 0),
      costPrice: purchasePrice !== undefined ? purchasePrice : (costPrice || 0),
      type: type || 'Finished Good',
      unit: unit || 'pcs',
      imageUrl: imageUrl || '',
      procurementStrategy: procurementStrategy || 'MTS',
      procurementType: procurementType || (type === 'Finished Good' ? 'MANUFACTURING' : 'PURCHASE'),
      defaultVendor: defaultVendor || undefined,
      reorderLevel: minStock !== undefined ? minStock : (reorderLevel || 10),
      targetStock: targetStock || 50
    });

    const initStock = Number(initialStock) || 0;
    if (initStock > 0) {
      await InventoryService.increase({
        organizationId: req.organizationId,
        productId: product._id,
        quantity: initStock,
        eventType: 'STOCK_ADJUSTMENT',
        referenceType: 'InitialSetup',
        referenceId: product._id.toString(),
        userId: req.user._id,
        notes: 'Initial opening stock balance'
      });
    } else {
      await InventoryBalance.create({
        organizationId: req.organizationId,
        product: product._id,
        onHand: 0,
        reserved: 0,
        incoming: 0
      });
    }

    await AuditService.log({
      organizationId: req.organizationId,
      action: 'PRODUCT_CREATED',
      module: 'Products',
      referenceType: 'Product',
      referenceId: product._id.toString(),
      user: req.user,
      description: `Created product ${product.name} (${product.sku})`
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.sellingPrice !== undefined) updates.salesPrice = updates.sellingPrice;
    if (updates.purchasePrice !== undefined) updates.costPrice = updates.purchasePrice;
    if (updates.minStock !== undefined) updates.reorderLevel = updates.minStock;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: { message: 'Product not found' } });
    }

    await AuditService.log({
      organizationId: req.organizationId,
      action: 'PRODUCT_UPDATED',
      module: 'Products',
      referenceType: 'Product',
      referenceId: product._id.toString(),
      user: req.user,
      description: `Updated product details for ${product.name}`
    });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!product) {
      return res.status(404).json({ success: false, error: { message: 'Product not found' } });
    }

    await AuditService.log({
      organizationId: req.organizationId,
      action: 'PRODUCT_DELETED',
      module: 'Products',
      referenceType: 'Product',
      referenceId: req.params.id,
      user: req.user,
      description: `Deleted product ${product.name}`
    });

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
