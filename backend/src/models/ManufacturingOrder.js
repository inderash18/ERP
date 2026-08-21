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

const workOrderSchema = new mongoose.Schema({
  operation: {
    type: String,
    required: true
  },
  workCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter'
  },
  workCenterName: String,
  durationMinutes: {
    type: Number,
    default: 30
  },
  assignee: String,
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  startedAt: Date,
  completedAt: Date
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
  salesOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesOrder'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  bom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoM'
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
  line: {
    type: String,
    default: 'Line Alpha (CNC Milling)'
  },
  progress: {
    type: Number,
    default: 0
  },
  components: [moComponentSchema],
  workOrders: [workOrderSchema],
  status: {
    type: String,
    enum: ['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNED'
  },
  startDate: Date,
  endDate: Date,
  targetDate: Date,
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('ManufacturingOrder', manufacturingOrderSchema);
