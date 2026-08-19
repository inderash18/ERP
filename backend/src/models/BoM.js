import mongoose from 'mongoose';

const bomOperationSchema = new mongoose.Schema({
  workCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    default: 0
  },
  sequence: {
    type: Number,
    default: 1
  }
});

const bomComponentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.0001
  }
});

const bomSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true
  },
  components: [bomComponentSchema],
  operations: [bomOperationSchema],
  version: {
    type: String,
    default: '1.0'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('BoM', bomSchema);
