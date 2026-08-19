import mongoose from 'mongoose';

const inventoryBalanceSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  // Total physical stock sitting in the warehouse
  onHand: {
    type: Number,
    default: 0,
    min: 0 // Cannot have negative physical stock
  },
  // Stock that is reserved for active Sales Orders or Manufacturing Orders
  reserved: {
    type: Number,
    default: 0,
    min: 0
  },
  // Stock that is confirmed to arrive from Purchase Orders or Manufacturing
  incoming: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure one balance record per product per organization
inventoryBalanceSchema.index({ organizationId: 1, product: 1 }, { unique: true });

// Virtual field for "Free to Use" quantity: onHand - reserved
// The prompt specifies: available = onHand - reserved
inventoryBalanceSchema.virtual('available').get(function() {
  return this.onHand - this.reserved;
});

export default mongoose.model('InventoryBalance', inventoryBalanceSchema);
