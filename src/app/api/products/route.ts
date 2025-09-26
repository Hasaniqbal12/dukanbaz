import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Product from '../../../models/Product';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';

// TypeScript interfaces for product variations
interface ProductOptionValue {
  name: string;
  value: string;
  image?: string;
  color?: string;
  priceModifier?: number;
}

interface ProductOption {
  name: string;
  type: string;
  values: ProductOptionValue[];
}

interface VariationAttribute {
  name: string;
  value: string;
}

interface VariationCombination {
  _id: string;
  attributes: VariationAttribute[];
  priceTiers: Array<{
    minQty: number;
    maxQty?: number;
    price: number;
    currency: string;
  }>;
  stock: number;
  moq: number;
  sku: string;
  leadTime: string;
  images: string[];
  available: boolean;
}

// Helper function to process product variations
function processProductVariations(options: ProductOption[], basePrice: number) {
  if (!options || options.length === 0) return null;

  // Convert frontend options to backend attributes
  const attributes = options.map(option => ({
    name: option.name,
    values: option.values.map((value: ProductOptionValue) => ({
      name: value.name,
      image: value.image || undefined,
      hexCode: option.type === 'color' ? value.color : undefined
    }))
  }));

  // Generate all possible combinations
  const combinations = generateCombinations(options, basePrice);

  return {
    attributes,
    combinations,
    defaultCombination: combinations.length > 0 ? combinations[0]._id : null
  };
}

// Helper function to generate all combinations
function generateCombinations(options: ProductOption[], basePrice: number): VariationCombination[] {
  if (options.length === 0) return [];

  type OptionValueItem = {
    optionName: string;
    valueName: string;
    valueId: string;
    priceModifier: number;
  };

  // Generate cartesian product of all option values
  const cartesianProduct = (arrays: OptionValueItem[][]): OptionValueItem[][] => {
    return arrays.reduce((acc, curr) => 
      acc.flatMap(x => curr.map(y => [...x, y]))
    , [[]] as OptionValueItem[][]);
  };

  const optionValues = options.map(option => 
    option.values.map((value: ProductOptionValue) => ({
      optionName: option.name,
      valueName: value.name,
      valueId: value.value,
      priceModifier: value.priceModifier || 0
    }))
  );

  const allCombinations = cartesianProduct(optionValues);

  return allCombinations.map((combination, index) => {
    const totalPriceModifier = combination.reduce((sum: number, item) => sum + item.priceModifier, 0);
    const finalPrice = basePrice + totalPriceModifier;

    return {
      _id: `combo_${index}`,
      attributes: combination.map((item) => ({
        name: item.optionName,
        value: item.valueName
      })),
      priceTiers: [{
        minQty: 1,
        maxQty: undefined,
        price: finalPrice,
        currency: 'PKR'
      }],
      stock: 1000, // Default stock
      moq: 1,
      sku: `SKU_${index}`,
      leadTime: '7-15 days',
      images: [],
      available: true
    };
  });
}

interface ProductDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  supplier: {
    id: string;
    name: string;
    verified: boolean;
  };
  status: string;
  featured?: boolean;
  tags?: string[];
  variations?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: ProductDocument[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

// GET - Fetch products with search, filter, pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const supplier = searchParams.get('supplier') || '';
    const verified = searchParams.get('verified') === 'true';
    const featured = searchParams.get('featured') === 'true';

    // Build query
    const query: Record<string, unknown> = {
      status: 'active',
      'price': { $gte: minPrice, $lte: maxPrice }
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (supplier) {
      if (supplier === 'me') {
        // Get current user's products
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
          const user = await User.findOne({ email: session.user.email });
          if (user) {
            query['supplier.id'] = user._id.toString();
          } else {
            // If user not found, return empty results
            query._id = { $exists: false };
          }
        } else {
          // If not authenticated, return empty results
          query._id = { $exists: false };
        }
      } else {
        query['supplier.name'] = { $regex: supplier, $options: 'i' };
      }
    }

    if (verified) {
      query['supplier.verified'] = true;
    }

    if (featured) {
      query.featured = true;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, number> = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    const response: ProductsResponse = {
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'supplier') {
      return NextResponse.json(
        { success: false, error: 'Only suppliers can create products' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const productData = await request.json();

    // Get supplier information from user session
    const supplier = await User.findById(session.user.id);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check if dropshipping is enabled and validate membership
    if (productData.shippingInfo?.dropshippingAvailable) {
      if (!supplier.hasDropshippingAccess()) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Premium membership required to offer dropshipping',
            requiresUpgrade: true,
            currentTier: supplier.membership?.tier || 'basic'
          },
          { status: 403 }
        );
      }
    }

    // Process variations and generate combinations
    let processedVariations = null;
    if (productData.options && productData.options.length > 0) {
      processedVariations = processProductVariations(productData.options, productData.price);
    }

    // Create product with supplier information
    const newProduct = new Product({
      ...productData,
      variations: processedVariations,
      supplier: {
        id: supplier._id.toString(),
        name: supplier.name,
        email: supplier.email,
        verified: supplier.verified || false,
        location: supplier.city || 'Pakistan',
        rating: supplier.rating || 4.5,
        responseTime: '< 24 hours',
        totalProducts: await Product.countDocuments({ 'supplier.id': supplier._id.toString() }) + 1,
        yearsInBusiness: supplier.yearsInBusiness || 1,
        logo: supplier.profilePicture || undefined
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedProduct = await newProduct.save();

    return NextResponse.json({
      success: true,
      data: savedProduct,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 