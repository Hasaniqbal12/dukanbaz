import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  requestId: string | number;
  supplierId: mongoose.Types.ObjectId | string;
  price: string;
  moq: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>({
  requestId: { type: Schema.Types.Mixed, required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: String, required: true },
  moq: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema); 