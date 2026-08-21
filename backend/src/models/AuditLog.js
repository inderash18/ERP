import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  referenceType: {
    type: String,
    default: 'N/A'
  },
  referenceId: {
    type: String,
    default: 'N/A'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: {
    type: String,
    default: 'System'
  },
  userName: {
    type: String,
    default: 'System'
  },
  description: {
    type: String,
    required: true
  },
  diff: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

auditLogSchema.index({ organizationId: 1, timestamp: -1 });
auditLogSchema.index({ organizationId: 1, module: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
