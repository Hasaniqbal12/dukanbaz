import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  title: string;
  img: string;
  slug?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  title: { type: String, required: true },
  img: { type: String, required: true },
  slug: { type: String },
  description: { type: String },
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);