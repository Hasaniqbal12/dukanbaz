import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiry extends Document {
  productId: mongoose.Types.ObjectId;
  productTitle?: string;
  supplierId: mongoose.Types.ObjectId;
  buyerId?: mongoose.Types.ObjectId;
  buyerName: string;
  buyerEmail?: string;
  companyName?: string;
  country?: string;
  quantity?: number;
  unit?: string;
  targetPrice?: number;
  message: string;
  attachments?: Array<{
    name: string;
    url: string;
    type?: string;
    size?: number;
  }>;
  contactMethod?: 'chat' | 'email' | 'phone';
  status: 'new' | 'replied' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  productTitle: { type: String },
  supplierId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  buyerName: { type: String, required: true, trim: true },
  buyerEmail: { type: String, trim: true },
  companyName: { type: String, trim: true },
  country: { type: String, trim: true },
  quantity: { type: Number, min: 0 },
  unit: { type: String, trim: true },
  targetPrice: { type: Number, min: 0 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  attachments: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String },
      size: { type: Number },
    },
  ],
  contactMethod: { type: String, enum: ['chat', 'email', 'phone'], default: 'chat' },
  status: { type: String, enum: ['new', 'replied', 'closed'], default: 'new', index: true },
}, { timestamps: true });

const Inquiry = mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);
export default Inquiry;
