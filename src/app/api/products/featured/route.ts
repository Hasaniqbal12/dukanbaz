import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import User from '../../../../models/User';

// Interface for product response
interface ProductResponse {
  _id: string;
  title: string;
  name: string;
  images: string[];
  price: number;
  originalPrice?: number;
  comparePrice?: number;
  minimumOrderQuantity: number;
  moq?: number;
  supplier: {
    _id: string;
    name: string;
    companyName?: string;
    verified: boolean;
    location?: string;
  };
  rating: number;
  reviewCount: number;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  category: string;
  subcategory?: string;
  featured: boolean;
  tags: string[];
}

// GET - Fetch featured, recent, and random products
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'featured'; // featured, recent, random, recommended
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {}; // Show all products for now
    let sortOptions: Record<string, 1 | -1> = {};

    switch (type) {
      case 'featured':
        // Featured products - just get all products and sort by creation date
        sortOptions = { createdAt: -1 };
        break;

      case 'recent':
        // Recent products - sorted by creation date
        sortOptions = { createdAt: -1 };
        break;

      case 'random':
        // Random products - use MongoDB's $sample aggregation
        const randomProducts = await Product.aggregate([
          { $match: query },
          { $sample: { size: limit } },
          {
            $lookup: {
              from: 'users',
              localField: 'supplier',
              foreignField: '_id',
              as: 'supplierInfo'
            }
          },
          {
            $addFields: {
              supplier: {
                $let: {
                  vars: { supplierData: { $arrayElemAt: ['$supplierInfo', 0] } },
                  in: {
                    _id: '$$supplierData._id',
                    name: '$$supplierData.name',
                    companyName: '$$supplierData.companyName',
                    verified: { $ifNull: ['$$supplierData.verified', false] },
                    location: '$$supplierData.location'
                  }
                }
              }
            }
          },
          { $project: { supplierInfo: 0 } }
        ]);

        return NextResponse.json({
          success: true,
          products: randomProducts,
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalProducts: randomProducts.length,
            hasNext: false,
            hasPrev: false
          }
        });

      case 'recommended':
        // Recommended products - just get all products and sort by creation date
        sortOptions = { createdAt: -1 };
        break;

      default:
        sortOptions = { createdAt: -1 };
    }

    // For non-random queries, use regular find with populate
    if (type !== 'random') {
      const products = await Product.find(query)
        .populate({
          path: 'supplier',
          select: 'name companyName verified location',
          model: 'User'
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      // Transform products to match interface
      const transformedProducts = products.map((product: any) => ({
        _id: product._id.toString(),
        title: product.title || product.name,
        name: product.name || product.title,
        images: product.images || [],
        price: product.price || 0,
        originalPrice: product.originalPrice,
        comparePrice: product.comparePrice,
        minimumOrderQuantity: product.minimumOrderQuantity || product.moq || 1,
        moq: product.moq || product.minimumOrderQuantity || 1,
        supplier: {
          _id: product.supplier?._id?.toString() || '',
          name: product.supplier?.name || 'Unknown Supplier',
          companyName: product.supplier?.companyName,
          verified: Boolean(product.supplier?.verified),
          location: product.supplier?.location
        },
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        discount: product.discount,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        views: product.views || 0,
        category: product.category || 'General',
        subcategory: product.subcategory,
        featured: Boolean(product.featured),
        tags: product.tags || []
      }));

      return NextResponse.json({
        success: true,
        products: transformedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    }

  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
