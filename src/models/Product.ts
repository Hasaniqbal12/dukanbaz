import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  longDescription?: string;
  images: string[];
  price: number;
  originalPrice?: number;
  priceRange?: string;
  priceTiers: Array<{
    minQty: number;
    maxQty?: number;
    price: number;
    label: string;
  }>;
  category: string;
  subcategory?: string;
  moq: string; // Minimum Order Quantity
  available: number;
  unit: string; // piece, kg, meter, etc.
  supplier: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    location: string;
    rating: number;
    responseTime: string;
    totalProducts: number;
    yearsInBusiness: number;
    logo?: string;
  };
  specifications: Array<{
    name: string;
    value: string;
  }>;
  features: string[];
  tags: string[];
  rating: number;
  totalReviews: number;
  reviews: Array<{
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: Date;
    verified: boolean;
  }>;
  shippingInfo: {
    fastShipping: boolean;
    estimatedDays: string;
    shippingCost: string;
    freeShippingThreshold?: number;
    dropshippingAvailable: boolean;
    dropshippingFee?: number;
  };
  certifications: string[];
  options: Array<{
    id: string;
    name: string;
    type: 'color' | 'size' | 'material' | 'style' | 'dropdown';
    values: Array<{
      id: string;
      name: string;
      value: string;
      color?: string;
      priceModifier?: number;
      image?: string;
    }>;
    required: boolean;
  }>;
  status: 'active' | 'inactive' | 'draft' | 'outofstock';
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  views: number;
  sold: number;
  createdAt: Date;
  updatedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

const ProductSchema = new Schema<IProduct, mongoose.Model<IProduct>, { updateRating: () => void }>({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  longDescription: {
    type: String,
    trim: true,
    maxlength: [5000, 'Long description cannot exceed 5000 characters']
  },
  images: {
    type: [String],
    required: [true, 'At least one product image is required'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0 && v.length <= 10;
      },
      message: 'Product must have between 1 and 10 images'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive']
  },
  priceRange: String,
  priceTiers: [{
    minQty: {
      type: Number,
      required: true,
      min: 1
    },
    maxQty: {
      type: Number,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    label: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  moq: {
    type: String,
    required: [true, 'Minimum order quantity is required']
  },
  available: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity must be non-negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'kg', 'gram', 'meter', 'yard', 'liter', 'box', 'pack', 'dozen', 'set']
  },
  supplier: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    responseTime: {
      type: String,
      default: '< 24 hours'
    },
    totalProducts: {
      type: Number,
      default: 0
    },
    yearsInBusiness: {
      type: Number,
      default: 0
    },
    logo: String
  },
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  features: [String],
  tags: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  reviews: [{
    id: String,
    userId: String,
    userName: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  shippingInfo: {
    fastShipping: {
      type: Boolean,
      default: false
    },
    estimatedDays: {
      type: String,
      default: '5-7 business days'
    },
    shippingCost: {
      type: String,
      default: 'Calculated at checkout'
    },
    freeShippingThreshold: Number,
    dropshippingAvailable: {
      type: Boolean,
      default: false
    },
    dropshippingFee: {
      type: Number,
      default: 0
    }
  },
  certifications: [String],
  options: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['color', 'size', 'material', 'style', 'dropdown']
    },
    values: [{
      id: String,
      name: String,
      value: String,
      color: String,
      priceModifier: Number,
      image: String
    }],
    required: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'outofstock'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Indexes for better query performance
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ 'supplier.id': 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ featured: 1, trending: 1 });

// Virtual for calculating discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Method to update rating
ProductSchema.methods.updateRating = function(this: IProduct) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0);
    this.rating = totalRating / this.reviews.length;
    this.totalReviews = this.reviews.length;
  }
};

// Pre-save middleware
ProductSchema.pre('save', function(this: IProduct & { updateRating: () => void }, next) {
  this.updatedAt = new Date();
  
  // Update rating if reviews changed
  this.updateRating();
  
  // Generate price range if price tiers exist
  if (this.priceTiers && this.priceTiers.length > 0) {
    const prices = this.priceTiers.map(tier => tier.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    this.priceRange = minPrice === maxPrice 
      ? `PKR ${minPrice.toLocaleString()}` 
      : `PKR ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
  }
  
  next();
});

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product; 