import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IMembership {
  tier: 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  features: {
    dropshippingAccess: boolean;
    bulkOrderDiscount: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    advancedAnalytics: boolean;
  };
  paymentHistory: Array<{
    amount: number;
    currency: string;
    paymentDate: Date;
    paymentMethod: string;
    transactionId: string;
  }>;
}

export interface IBusinessInfo {
  businessName?: string;
  businessType?: string;
  taxId?: string;
  businessAddress?: IAddress;
  businessPhone?: string;
  businessEmail?: string;
  establishedYear?: number;
  employeeCount?: string;
  annualRevenue?: string;
  certifications?: string[];
}

export interface IBuyerProfile {
  productCategories?: string[];
  budgetRange?: string;
  orderFrequency?: string;
  preferredSuppliers?: string[];
  paymentTerms?: string;
  creditLimit?: string;
}

export interface ISupplierProfile {
  productCategories?: string[];
  minOrderQuantity?: string;
  productionCapacity?: string;
  certifications?: string[];
  shippingMethods?: string[];
  paymentTerms?: string;
  minimumOrder?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'supplier' | 'admin';
  company?: string;
  location?: string;
  phone?: string;
  website?: string;
  bio?: string;
  profileSetupCompleted?: boolean;
  verified: boolean;
  isActive: boolean;
  banned: boolean;
  address?: IAddress;
  businessInfo?: IBusinessInfo;
  membership?: IMembership;
  buyerProfile?: IBuyerProfile;
  supplierProfile?: ISupplierProfile;
  avatar?: string;
  lastLogin?: Date;
  deletedAt?: Date;
  setupCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String, default: 'Pakistan' }
}, { _id: false });

const BusinessInfoSchema = new Schema<IBusinessInfo>({
  businessName: { type: String },
  businessType: { type: String },
  taxId: { type: String },
  businessAddress: { type: AddressSchema },
  businessPhone: { type: String },
  businessEmail: { type: String },
  establishedYear: { type: Number },
  employeeCount: { 
    type: String, 
    enum: ['1-10', '11-50', '51-100', '101-500', '500+'] 
  },
  annualRevenue: { 
    type: String, 
    enum: ['<1M', '1M-5M', '5M-10M', '10M-50M', '50M+'] 
  },
  certifications: [{ type: String }]
}, { _id: false });

const MembershipSchema = new Schema<IMembership>({
  tier: { 
    type: String, 
    enum: ['basic', 'premium', 'enterprise'], 
    default: 'basic' 
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  features: {
    dropshippingAccess: { type: Boolean, default: false },
    bulkOrderDiscount: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false }
  },
  paymentHistory: [{
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentDate: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, required: true }
  }]
}, { _id: false });

const BuyerProfileSchema = new Schema<IBuyerProfile>({
  productCategories: [{ type: String }],
  budgetRange: { type: String },
  orderFrequency: { type: String },
  preferredSuppliers: [{ type: String }],
  paymentTerms: { type: String },
  creditLimit: { type: String }
}, { _id: false });

const SupplierProfileSchema = new Schema<ISupplierProfile>({
  productCategories: [{ type: String }],
  minOrderQuantity: { type: String },
  productionCapacity: { type: String },
  certifications: [{ type: String }],
  shippingMethods: [{ type: String }],
  paymentTerms: { type: String },
  minimumOrder: { type: String }
}, { _id: false });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['buyer', 'supplier', 'admin'], 
    required: true,
    default: 'buyer'
  },
  company: { type: String },
  location: { type: String },
  phone: { type: String },
  website: { type: String },
  bio: { type: String, maxlength: 500 },
  profileSetupCompleted: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false },
  address: { type: AddressSchema },
  businessInfo: { type: BusinessInfoSchema },
  membership: { type: MembershipSchema },
  buyerProfile: { type: BuyerProfileSchema },
  supplierProfile: { type: SupplierProfileSchema },
  avatar: { type: String },
  lastLogin: { type: Date },
  deletedAt: { type: Date },
  setupCompletedAt: { type: Date }
}, { timestamps: true });

// Indexes for better query performance (email index is handled by unique: true)
UserSchema.index({ role: 1 });
UserSchema.index({ verified: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for display name
UserSchema.virtual('displayName').get(function() {
  return this.businessInfo?.businessName || this.company || this.name;
});

// Method to check if user is admin
UserSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Method to check if user has dropshipping access
UserSchema.methods.hasDropshippingAccess = function() {
  if (!this.membership) return false;
  return this.membership.isActive && this.membership.features.dropshippingAccess;
};

// Method to check if membership is active
UserSchema.methods.hasActiveMembership = function() {
  if (!this.membership) return false;
  const now = new Date();
  return this.membership.isActive && 
         (!this.membership.endDate || this.membership.endDate > now);
};

// Method to get membership tier
UserSchema.methods.getMembershipTier = function() {
  return this.membership?.tier || 'basic';
};

// Method to get public profile
UserSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    company: this.company,
    location: this.location,
    role: this.role,
    verified: this.verified,
    avatar: this.avatar,
    bio: this.bio,
    businessInfo: this.businessInfo ? {
      businessName: this.businessInfo.businessName,
      businessType: this.businessInfo.businessType,
      establishedYear: this.businessInfo.establishedYear,
      employeeCount: this.businessInfo.employeeCount
    } : undefined
  };
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 