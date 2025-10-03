import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import Product from '../../../../models/Product';

// GET - Fetch random products using MongoDB aggregation
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const category = searchParams.get('category');
    
    // Build match stage for aggregation
    const matchStage: Record<string, unknown> = {};
    
    if (category) {
      matchStage.category = category;
    }

    // Use MongoDB aggregation pipeline for true randomization
    const randomProducts = await Product.aggregate([
      { $match: matchStage },
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
      {
        $project: {
          supplierInfo: 0,
          __v: 0
        }
      }
    ]);

    // Transform products to ensure consistent structure
    const transformedProducts = randomProducts.map((product) => ({
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
        currentPage: 1,
        totalPages: 1,
        totalProducts: transformedProducts.length,
        hasNext: false,
        hasPrev: false
      }
    });

  } catch (error) {
    console.error('Error fetching random products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch random products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
