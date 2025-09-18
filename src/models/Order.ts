import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderProduct {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  // Variation fields
  variantId?: string;
  variantName?: string;
  color?: string;
  size?: string;
  material?: string;
  style?: string;
  variationAttributes?: Array<{
    name: string;
    value: string;
  }>;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ICustomerAddress {
  name: string;
  email?: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  products: IOrderProduct[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: IShippingAddress;
  shippingMethod: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  notes?: string;
  // Dropshipping fields
  isDropshipping: boolean;
  customerAddress?: ICustomerAddress;
  dropshippingInstructions?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  buyerPhone: { type: String },
  supplierId: { type: String, required: true },
  supplierName: { type: String, required: true },
  supplierEmail: { type: String, required: true },
  products: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    specifications: { type: String },
    // Variation fields
    variantId: { type: String },
    variantName: { type: String },
    color: { type: String },
    size: { type: String },
    material: { type: String },
    style: { type: String },
    variationAttributes: [{
      name: { type: String },
      value: { type: String }
    }]
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Pakistan' }
  },
  shippingMethod: { type: String, required: true },
  estimatedDelivery: { type: String, required: true },
  actualDelivery: { type: String },
  notes: { type: String },
  // Dropshipping fields
  isDropshipping: { type: Boolean, default: false },
  customerAddress: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },
  dropshippingInstructions: { type: String },
  trackingNumber: { type: String }
}, { timestamps: true });

// Create indexes for better query performance
OrderSchema.index({ buyerId: 1 });
OrderSchema.index({ supplierId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ isDropshipping: 1 });

// Add method to generate order number
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema); 
 
 