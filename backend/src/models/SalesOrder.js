import mongoose from 'mongoose';

const soLineItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.0001
  },
  deliveredQuantity: {
    type: Number,
    default: 0
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const salesOrderSchema = new mongoose.Schema({
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
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [soLineItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'CONFIRMED', 'PROCESSING', 'PROCESSING_MTO', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'DRAFT'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED'],
    default: 'PENDING'
  },
  expectedDeliveryDate: Date,
  shippingAddress: String,
  notes: String
}, {
  timestamps: true
});

export default mongoose.model('SalesOrder', salesOrderSchema);
