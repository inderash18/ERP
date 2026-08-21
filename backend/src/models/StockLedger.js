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
    required: true
  },
  quantityChange: {
    type: Number,
    required: true
  },
  previousOnHand: {
    type: Number,
    required: true
  },
  newOnHand: {
    type: Number,
    required: true
  },
  previousReserved: {
    type: Number,
    default: 0
  },
  newReserved: {
    type: Number,
    default: 0
  },
  referenceType: {
    type: String,
    default: 'MANUAL_ADJUSTMENT'
  },
  referenceId: {
    type: mongoose.Schema.Types.Mixed,
    default: 'N/A'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

stockLedgerSchema.index({ organizationId: 1, product: 1, createdAt: -1 });

export default mongoose.model('StockLedger', stockLedgerSchema);
