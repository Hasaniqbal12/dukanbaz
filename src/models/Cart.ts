import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItemBase {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  addedAt: Date;
  isBulkOrder: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  bulkDiscount?: {
    minQty: number;
    discountPercent: number;
  }[];
}

export interface IRegularCartItem extends ICartItemBase {
  type: 'regular';
  variantId?: string;
  variantName?: string;
  // Individual variation attributes
  color?: string;
  size?: string;
  material?: string;
  style?: string;
  // Variation combination details
  variationAttributes?: {
    name: string;
    value: string;
  }[];
}

export interface IBidCartItem extends ICartItemBase {
  type: 'bid';
  requestId: mongoose.Types.ObjectId;
  originalPrice: number;
  discountPercent: number;
}

export type ICartItem = IRegularCartItem | IBidCartItem;

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  // Common fields
  type: { type: String, required: true, enum: ['regular', 'bid'] },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  supplierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  supplierName: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
  isBulkOrder: { type: Boolean, default: false },
  minOrderQuantity: { type: Number, min: 1 },
  maxOrderQuantity: { type: Number, min: 1 },
  bulkDiscount: [{
    minQty: { type: Number, required: true, min: 1 },
    discountPercent: { type: Number, required: true, min: 0, max: 100 }
  }],
  
  // Regular product fields
  variantId: { type: String },
  variantName: { type: String },
  
  // Individual variation attributes
  color: { type: String },
  size: { type: String },
  material: { type: String },
  style: { type: String },
  
  // Variation combination details
  variationAttributes: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  
  // Bid-specific fields (only for type: 'bid')
  requestId: { type: Schema.Types.ObjectId, ref: 'Request' },
  originalPrice: { type: Number, min: 0 },
  discountPercent: { type: Number, min: 0, max: 100 }
}, { discriminatorKey: 'type' });

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema]
  },
  { timestamps: true }
);

// Index already created by unique: true on userId field

const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
