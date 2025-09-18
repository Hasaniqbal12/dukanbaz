import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  images: [{
    type: String,
    required: true
  }],
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
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
    }
  }],
  category: { 
    type: String, 
    required: true,
    trim: true
  },
  moq: { 
    type: String, 
    default: '1',
    trim: true
  },
  available: { 
    type: Number, 
    default: 1000,
    min: 0
  },
  sold: { 
    type: Number, 
    default: 0,
    min: 0
  },
  rating: { 
    type: Number, 
    default: 4.5,
    min: 0,
    max: 5
  },
  reviewCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  featured: { 
    type: Boolean, 
    default: false
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
      lowercase: true,
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
      default: 4.5,
      min: 0,
      max: 5
    },
    responseTime: {
      type: String,
      default: '< 24 hours'
    },
    totalProducts: {
      type: Number,
      default: 1,
      min: 0
    },
    yearsInBusiness: {
      type: Number,
      default: 1,
      min: 0
    },
    logo: String
  },
  specifications: [{
    name: String,
    value: String
  }],
  // Alibaba-style variations system
  variations: {
    // Variation attributes (Color, Size, Material, etc.)
    attributes: [{
      name: {
        type: String,
        required: true,
        trim: true
      }, // e.g., "Color", "Size", "Material"
      values: [{
        name: {
          type: String,
          required: true,
          trim: true
        }, // e.g., "Red", "Large", "Cotton"
        image: String, // Optional image for this attribute value
        hexCode: String // For colors
      }]
    }],
    
    // All possible combinations with individual pricing
    combinations: [{
      // Attribute combination (e.g., {Color: "Red", Size: "Large"})
      attributes: [{
        name: String, // "Color"
        value: String // "Red"
      }],
      
      // Pricing tiers for this specific combination
      priceTiers: [{
        minQty: {
          type: Number,
          required: true,
          min: 1
        },
        maxQty: Number,
        price: {
          type: Number,
          required: true,
          min: 0
        },
        currency: {
          type: String,
          default: 'USD'
        }
      }],
      
      // Stock and availability for this combination
      stock: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Minimum order quantity for this combination
      moq: {
        type: Number,
        default: 1,
        min: 1
      },
      
      // SKU for this specific combination
      sku: {
        type: String,
        trim: true
      },
      
      // Lead time for this combination
      leadTime: {
        type: String,
        default: '7-15 days'
      },
      
      // Images specific to this combination
      images: [String],
      
      // Whether this combination is available
      available: {
        type: Boolean,
        default: true
      }
    }],
    
    // Default combination (used when no specific combination is selected)
    defaultCombination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product.variations.combinations'
    }
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ 'supplier.id': 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for price range
productSchema.virtual('priceRange').get(function() {
  if (!this.priceTiers || this.priceTiers.length === 0) {
    return { min: this.price, max: this.price };
  }
  
  const prices = this.priceTiers.map(tier => tier.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
