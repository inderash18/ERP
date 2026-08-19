import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true // e.g., 'ADMIN', 'SALES'
  },
  permissions: [{
    type: String // e.g., 'product.view', 'sales.create'
  }],
  isSystem: {
    type: Boolean,
    default: false // System roles like OWNER might be immutable
  }
}, {
  timestamps: true
});

roleSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model('Role', roleSchema);
