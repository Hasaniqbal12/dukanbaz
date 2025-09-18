const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wholesalehub';

// Product Schema (with variations support)
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  price: { type: Number, required: true },
  priceTiers: [{
    minQty: Number,
    maxQty: Number,
    price: Number
  }],
  category: { type: String, required: true },
  moq: { type: String, default: '1' },
  available: { type: Number, default: 1000 },
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  tags: [String],
  status: { type: String, default: 'active' },
  featured: { type: Boolean, default: false },
  supplier: {
    id: String,
    name: String,
    email: String,
    verified: Boolean,
    location: String,
    rating: Number,
    responseTime: String,
    totalProducts: Number,
    yearsInBusiness: Number,
    logo: String
  },
  // Variation support
  variations: {
    attributes: [{
      name: String,
      values: [String]
    }],
    combinations: [{
      id: String,
      attributes: [{
        name: String,
        value: String
      }],
      price: Number,
      stock: Number,
      sku: String,
      images: [String]
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Sample products data with working image URLs
const sampleProducts = [
  {
    title: "Premium Cotton T-Shirts (Bulk Pack)",
    description: "High-quality 100% cotton t-shirts perfect for wholesale. Available in multiple colors and sizes. Ideal for retail stores, promotional events, and corporate branding.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop"
    ],
    price: 450,
    priceTiers: [
      { minQty: 50, maxQty: 199, price: 450 },
      { minQty: 200, maxQty: 499, price: 420 },
      { minQty: 500, maxQty: 999, price: 380 },
      { minQty: 1000, price: 350 }
    ],
    category: "Clothing & Apparel",
    moq: "50",
    available: 5000,
    sold: 1250,
    rating: 4.7,
    reviewCount: 89,
    tags: ["cotton", "t-shirt", "bulk", "wholesale", "apparel"],
    featured: true,
    supplier: {
      id: "supplier_001",
      name: "Karachi Textile Mills",
      email: "sales@karachitextile.com",
      verified: true,
      location: "Karachi, Pakistan",
      rating: 4.8,
      responseTime: "< 2 hours",
      totalProducts: 45,
      yearsInBusiness: 8,
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
    },
    variations: {
      attributes: [
        {
          name: "Color",
          values: ["White", "Black", "Navy", "Red", "Gray"]
        },
        {
          name: "Size",
          values: ["S", "M", "L", "XL", "XXL"]
        }
      ],
      combinations: [
        {
          id: "white-s",
          attributes: [
            { name: "Color", value: "White" },
            { name: "Size", value: "S" }
          ],
          price: 450,
          stock: 200,
          sku: "CT-WH-S",
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"]
        },
        {
          id: "white-m",
          attributes: [
            { name: "Color", value: "White" },
            { name: "Size", value: "M" }
          ],
          price: 450,
          stock: 300,
          sku: "CT-WH-M",
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"]
        },
        {
          id: "white-l",
          attributes: [
            { name: "Color", value: "White" },
            { name: "Size", value: "L" }
          ],
          price: 450,
          stock: 400,
          sku: "CT-WH-L",
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"]
        },
        {
          id: "black-m",
          attributes: [
            { name: "Color", value: "Black" },
            { name: "Size", value: "M" }
          ],
          price: 450,
          stock: 250,
          sku: "CT-BK-M",
          images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop"]
        },
        {
          id: "black-l",
          attributes: [
            { name: "Color", value: "Black" },
            { name: "Size", value: "L" }
          ],
          price: 450,
          stock: 350,
          sku: "CT-BK-L",
          images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop"]
        }
      ]
    }
  },
  {
    title: "Wireless Bluetooth Earbuds (Wholesale)",
    description: "High-quality wireless earbuds with noise cancellation. Perfect for electronics retailers. Includes charging case and multiple ear tip sizes.",
    images: [
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop"
    ],
    price: 2500,
    priceTiers: [
      { minQty: 10, maxQty: 49, price: 2500 },
      { minQty: 50, maxQty: 99, price: 2200 },
      { minQty: 100, maxQty: 499, price: 1950 },
      { minQty: 500, price: 1750 }
    ],
    category: "Electronics",
    moq: "10",
    available: 2000,
    sold: 450,
    rating: 4.5,
    reviewCount: 67,
    tags: ["bluetooth", "earbuds", "wireless", "electronics", "audio"],
    featured: true,
    supplier: {
      id: "supplier_002",
      name: "Lahore Electronics Hub",
      email: "orders@lahoreelectronics.pk",
      verified: true,
      location: "Lahore, Pakistan",
      rating: 4.6,
      responseTime: "< 4 hours",
      totalProducts: 78,
      yearsInBusiness: 5,
      logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop"
    }
  },
  {
    title: "Stainless Steel Water Bottles (Bulk)",
    description: "Durable stainless steel water bottles with vacuum insulation. Perfect for gyms, offices, and promotional giveaways. Available in multiple colors.",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop"
    ],
    price: 850,
    priceTiers: [
      { minQty: 25, maxQty: 99, price: 850 },
      { minQty: 100, maxQty: 249, price: 780 },
      { minQty: 250, maxQty: 499, price: 720 },
      { minQty: 500, price: 650 }
    ],
    category: "Home & Kitchen",
    moq: "25",
    available: 3000,
    sold: 890,
    rating: 4.8,
    reviewCount: 134,
    tags: ["water bottle", "stainless steel", "insulated", "bulk", "promotional"],
    featured: false,
    supplier: {
      id: "supplier_003",
      name: "Islamabad Home Goods",
      email: "wholesale@islamabadhome.com",
      verified: true,
      location: "Islamabad, Pakistan",
      rating: 4.7,
      responseTime: "< 6 hours",
      totalProducts: 32,
      yearsInBusiness: 3,
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
    }
  },
  {
    title: "LED Desk Lamps (Office Bulk Pack)",
    description: "Modern LED desk lamps with adjustable brightness and USB charging ports. Ideal for offices, co-working spaces, and retail electronics stores.",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&h=500&fit=crop"
    ],
    price: 3200,
    priceTiers: [
      { minQty: 5, maxQty: 19, price: 3200 },
      { minQty: 20, maxQty: 49, price: 2950 },
      { minQty: 50, maxQty: 99, price: 2700 },
      { minQty: 100, price: 2450 }
    ],
    category: "Electronics",
    moq: "5",
    available: 800,
    sold: 156,
    rating: 4.4,
    reviewCount: 43,
    tags: ["led", "desk lamp", "office", "lighting", "usb charging"],
    featured: false,
    supplier: {
      id: "supplier_002",
      name: "Lahore Electronics Hub",
      email: "orders@lahoreelectronics.pk",
      verified: true,
      location: "Lahore, Pakistan",
      rating: 4.6,
      responseTime: "< 4 hours",
      totalProducts: 78,
      yearsInBusiness: 5,
      logo: "https://images.unsplash.com/photo-1560472355-536de3962603?w=100&h=100&fit=crop"
    }
  },
  {
    title: "Canvas Tote Bags (Eco-Friendly Bulk)",
    description: "Sustainable canvas tote bags perfect for retail stores, events, and promotional campaigns. Made from 100% organic cotton canvas.",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop"
    ],
    price: 320,
    priceTiers: [
      { minQty: 100, maxQty: 299, price: 320 },
      { minQty: 300, maxQty: 599, price: 280 },
      { minQty: 600, maxQty: 999, price: 250 },
      { minQty: 1000, price: 220 }
    ],
    category: "Bags & Accessories",
    moq: "100",
    available: 10000,
    sold: 2340,
    rating: 4.6,
    reviewCount: 178,
    tags: ["canvas", "tote bag", "eco-friendly", "promotional", "organic cotton"],
    featured: true,
    supplier: {
      id: "supplier_004",
      name: "Faisalabad Eco Products",
      email: "sales@faisalabadeco.pk",
      verified: true,
      location: "Faisalabad, Pakistan",
      rating: 4.9,
      responseTime: "< 3 hours",
      totalProducts: 28,
      yearsInBusiness: 6,
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
    }
  },
  {
    title: "Ceramic Coffee Mugs (Restaurant Bulk)",
    description: "Professional-grade ceramic coffee mugs perfect for restaurants, cafes, and hotels. Dishwasher and microwave safe.",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop"
    ],
    price: 180,
    priceTiers: [
      { minQty: 50, maxQty: 199, price: 180 },
      { minQty: 200, maxQty: 499, price: 160 },
      { minQty: 500, maxQty: 999, price: 140 },
      { minQty: 1000, price: 120 }
    ],
    category: "Home & Kitchen",
    moq: "50",
    available: 15000,
    sold: 4560,
    rating: 4.7,
    reviewCount: 267,
    tags: ["ceramic", "coffee mug", "restaurant", "dishwasher safe", "bulk"],
    featured: false,
    supplier: {
      id: "supplier_005",
      name: "Gujranwala Ceramics",
      email: "orders@gujranwalaceramics.com",
      verified: true,
      location: "Gujranwala, Pakistan",
      rating: 4.8,
      responseTime: "< 5 hours",
      totalProducts: 67,
      yearsInBusiness: 12,
      logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${insertedProducts.length} sample products`);

    // Log some statistics
    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ featured: true });
    const categories = await Product.distinct('category');
    
    console.log('\n📊 Database Statistics:');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Featured Products: ${featuredProducts}`);
    console.log(`Categories: ${categories.join(', ')}`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProducts };
