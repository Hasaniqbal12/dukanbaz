import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  requestNumber: string;
  buyerId: mongoose.Types.ObjectId;
  buyerName: string;
  buyerEmail: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  maxBudget: number;
  description: string;
  specifications?: string;
  preferredBrands: string[];
  location: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  contactMethod: 'platform' | 'email' | 'phone';
  additionalRequirements?: string;
  attachments: string[];
  status: 'open' | 'closed' | 'fulfilled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt: Date;
  offerCount: number;
  bidCount: number;
  viewCount: number;
  acceptedBid?: mongoose.Types.ObjectId; // Bid ID that was accepted
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  requestNumber: { type: String, required: true, unique: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'pieces' },
  targetPrice: { type: Number, required: true },
  maxBudget: { type: Number, required: true },
  description: { type: String, required: true },
  specifications: { type: String },
  preferredBrands: [{ type: String }],
  location: { type: String, default: 'Pakistan' },
  urgency: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  contactMethod: { 
    type: String, 
    enum: ['platform', 'email', 'phone'], 
    default: 'platform' 
  },
  additionalRequirements: { type: String },
  attachments: [{ type: String }],
  status: { 
    type: String, 
    enum: ['open', 'closed', 'fulfilled'], 
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  expiresAt: { type: Date, required: true },
  offerCount: { type: Number, default: 0 },
  bidCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  acceptedBid: { 
    type: Schema.Types.ObjectId, 
    ref: 'Bid' 
  },
  acceptedAt: { type: Date }
}, { timestamps: true });

// Add indexes for better query performance
RequestSchema.index({ buyerId: 1 });
RequestSchema.index({ category: 1 });
RequestSchema.index({ status: 1 });
RequestSchema.index({ createdAt: -1 });
RequestSchema.index({ expiresAt: 1 });

export default mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);