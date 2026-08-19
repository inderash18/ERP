import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' }
  }
}, {
  timestamps: true
});

export default mongoose.model('Organization', organizationSchema);
