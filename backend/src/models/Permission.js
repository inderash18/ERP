import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String, // e.g. 'product.view', 'sales.create'
    required: true,
    unique: true,
    trim: true
  },
  module: {
    type: String, // e.g. 'Products', 'Sales'
    required: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Permission', permissionSchema);
