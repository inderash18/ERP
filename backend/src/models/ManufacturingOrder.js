import mongoose from 'mongoose';

const moComponentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantityRequired: {
    type: Number,
    required: true
  },
  quantityConsumed: {
    type: Number,
    default: 0
  }
});

const manufacturingOrderSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  bom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoM',
    required: true
  },
  quantityToProduce: {
    type: Number,
    required: true,
    min: 0.0001
  },
  quantityProduced: {
    type: Number,
    default: 0
  },
  components: [moComponentSchema],
  status: {
    type: String,
    enum: ['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT'
  },
  startDate: Date,
  endDate: Date,
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('ManufacturingOrder', manufacturingOrderSchema);
