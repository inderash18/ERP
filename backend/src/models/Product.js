import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  salesPrice: {
    type: Number,
    default: 0
  },
  costPrice: {
    type: Number,
    default: 0
  },
  // The system relies on Inventory Engine for dynamic availability,
  // but we may store cached quantity values here if needed. 
  // Following Rule 9: Do NOT simply store stock in Product. 
  // We will omit stock fields here and rely on InventoryBalance/StockLedger
  procurementStrategy: {
    type: String,
    enum: ['MTS', 'MTO'], // Make To Stock, Make To Order
    default: 'MTS'
  },
  procurementType: {
    type: String,
    enum: ['PURCHASE', 'MANUFACTURING'],
    default: 'PURCHASE'
  },
  defaultVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  reorderLevel: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.index({ organizationId: 1, sku: 1 }, { unique: true });

export default mongoose.model('Product', productSchema);
