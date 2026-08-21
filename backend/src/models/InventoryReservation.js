import mongoose from 'mongoose';

const inventoryReservationSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 0.0001
  },
  referenceType: {
    type: String,
    default: 'SALES_ORDER'
  },
  referenceId: {
    type: mongoose.Schema.Types.Mixed,
    default: 'N/A'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'FULFILLED', 'CANCELLED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

inventoryReservationSchema.index({ organizationId: 1, product: 1, status: 1 });
inventoryReservationSchema.index({ organizationId: 1, referenceType: 1, referenceId: 1 });

export default mongoose.model('InventoryReservation', inventoryReservationSchema);
