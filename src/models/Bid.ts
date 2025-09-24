import mongoose, { Schema, Document } from 'mongoose';

export interface IBid extends Document {
  _id: mongoose.Types.ObjectId;
  request: mongoose.Types.ObjectId; // Request ID
  supplier: mongoose.Types.ObjectId; // User ID of supplier
  product: mongoose.Types.ObjectId; // Product ID that supplier is offering
  bidPrice: number;
  originalPrice: number;
  quantity: number;
  message: string;
  deliveryTime: number; // in days
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  acceptedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>({
  request: {
    type: Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
    index: true
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  bidPrice: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    maxlength: 500,
    default: ''
  },
  deliveryTime: {
    type: Number,
    required: true,
    min: 1,
    max: 365 // max 1 year
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
BidSchema.index({ request: 1, status: 1 });
BidSchema.index({ supplier: 1, status: 1 });

// Prevent duplicate bids from same supplier on same request
BidSchema.index({ request: 1, supplier: 1 }, { unique: true });

export default mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema);