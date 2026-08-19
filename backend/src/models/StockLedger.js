import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema({
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
  eventType: {
    type: String,
    enum: [
      'PURCHASE_RECEIPT',
      'SALES_DELIVERY',
      'MANUFACTURING_CONSUMPTION',
      'MANUFACTURING_PRODUCTION',
      'INVENTORY_ADJUSTMENT',
      'RESERVATION',
      'RESERVATION_RELEASE'
    ],
    required: true
  },
  quantityChange: {
    type: Number,
    required: true
    // Positive for increases (Receipts, Production, positive Adjustments)
    // Negative for decreases (Deliveries, Consumption, negative Adjustments)
  },
  previousOnHand: {
    type: Number,
    required: true
  },
  newOnHand: {
    type: Number,
    required: true
  },
  referenceType: {
    type: String,
    enum: ['SALES_ORDER', 'PURCHASE_ORDER', 'MANUFACTURING_ORDER', 'MANUAL_ADJUSTMENT'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// For viewing history of a specific product
stockLedgerSchema.index({ organizationId: 1, product: 1, createdAt: -1 });

export default mongoose.model('StockLedger', stockLedgerSchema);
