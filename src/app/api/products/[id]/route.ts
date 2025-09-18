import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - Fetch single product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Await params in Next.js 15
    const { id } = await params;
    
    // Increment views and fetch updated doc
    const productDoc = await Product.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean() as any;
    
    if (!productDoc) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Normalize fields for frontend consumption similar to current page.tsx expectations
    const parseMoqNumber = (moq: unknown): number => {
      if (typeof moq === 'number') return moq;
      if (typeof moq === 'string') {
        const n = parseInt(moq.replace(/[^0-9]/g, ''));
        return isNaN(n) ? 1 : n;
      }
      return 1;
    };

    const normalized = {
      _id: String(productDoc._id),
      title: productDoc.title || productDoc.name,
      description: productDoc.description,
      images: productDoc.images || [],
      price: productDoc.price,
      comparePrice: productDoc.comparePrice ?? productDoc.originalPrice ?? undefined,
      category: productDoc.category,
      subcategory: productDoc.subcategory || undefined,
      moq: parseMoqNumber(productDoc.moq),
      stock: typeof productDoc.stock === 'number' ? productDoc.stock : (typeof productDoc.available === 'number' ? productDoc.available : 0),
      unit: productDoc.unit || 'pieces',
      supplier: {
        _id: productDoc.supplier?.id || productDoc.supplier?._id,
        name: productDoc.supplier?.name,
        companyName: productDoc.supplier?.companyName || productDoc.supplier?.name,
        location: productDoc.supplier?.location,
        verified: Boolean(productDoc.supplier?.verified),
      },
      rating: productDoc.rating ?? 0,
      reviewCount: productDoc.reviewCount ?? 0,
      tags: productDoc.tags || [],
      specifications: Array.isArray(productDoc.specifications)
        ? productDoc.specifications.reduce((acc: Record<string, string>, cur: { name?: string; value?: string }) => {
            if (cur && cur.name && typeof cur.value === 'string') acc[cur.name] = cur.value;
            return acc;
          }, {} as Record<string, string>)
        : ({} as Record<string, string>),
      createdAt: productDoc.createdAt,
      updatedAt: productDoc.updatedAt,
      views: productDoc.views ?? 0,
      // Alibaba-style pricing tiers
      priceTiers: productDoc.priceTiers || [
        { minQty: 10, maxQty: 49, price: productDoc.price * 1.1 },
        { minQty: 50, maxQty: 199, price: productDoc.price },
        { minQty: 200, maxQty: null, price: productDoc.price * 0.95 }
      ],
      // Product variations - map from options to variations format
      variations: productDoc.options && productDoc.options.length > 0 ? {
        attributes: productDoc.options.map((option: any) => ({
          name: option.name,
          values: option.values.map((value: any) => ({
            name: value.name,
            value: value.value,
            hexCode: value.color || undefined,
            priceModifier: value.priceModifier || 0
          }))
        })),
        combinations: [],
        defaultCombination: null
      } : productDoc.variations ? {
        attributes: productDoc.variations.attributes || [],
        combinations: productDoc.variations.combinations || [],
        defaultCombination: productDoc.variations.defaultCombination || null
      } : {
        attributes: [],
        combinations: [],
        defaultCombination: null
      },
      // Shipping information with dropshipping support
      shipping: productDoc.shippingInfo ? {
        weight: productDoc.shippingInfo.weight || 0.5,
        freeShipping: productDoc.shippingInfo.freeShipping || false,
        shippingCost: productDoc.shippingInfo.cost || productDoc.shippingInfo.shippingCost || 18129.80,
        estimatedDelivery: productDoc.shippingInfo.estimatedDelivery || '20 Oct',
        dropshippingAvailable: productDoc.shippingInfo.dropshippingAvailable || false,
        dropshippingFee: productDoc.shippingInfo.dropshippingFee || 0
      } : {
        weight: 0.5,
        freeShipping: false,
        shippingCost: 18129.80,
        estimatedDelivery: '20 Oct',
        dropshippingAvailable: false,
        dropshippingFee: 0
      }
    };

    return NextResponse.json(normalized);
    
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: 'Only suppliers can update products' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    // Await params in Next.js 15
    const { id } = await params;
    const data = await req.json();

    // Get supplier information to validate membership
    const supplier = await User.findById(session.user.id);
    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check if dropshipping is being enabled and validate membership
    if (data.shippingInfo?.dropshippingAvailable) {
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
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'price', 'moq', 'stock', 'delivery', 'shipping'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate numeric fields
    if (isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid positive number' },
        { status: 400 }
      );
    }
    
    if (isNaN(parseInt(data.moq)) || parseInt(data.moq) < 1) {
      return NextResponse.json(
        { error: 'MOQ must be a valid positive number' },
        { status: 400 }
      );
    }
    
    if (isNaN(parseInt(data.stock)) || parseInt(data.stock) < 0) {
      return NextResponse.json(
        { error: 'Stock must be a valid non-negative number' },
        { status: 400 }
      );
    }
    
    // Process tags
    let tags = [];
    if (data.tags) {
      tags = typeof data.tags === 'string' 
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : data.tags;
    }
    
    // Process weight
    let weight = null;
    if (data.weight && !isNaN(parseFloat(data.weight))) {
      weight = parseFloat(data.weight);
    }
    
    // Update data
    const updateData = {
      name: data.name.trim(),
      description: data.description.trim(),
      images: data.images || [],
      imagePreviews: data.imagePreviews || [],
      category: data.category,
      subcategory: data.subcategory || '',
      price: parseFloat(data.price),
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
      moq: parseInt(data.moq),
      stock: parseInt(data.stock),
      delivery: data.delivery.trim(),
      shipping: data.shipping,
      tags,
      featured: Boolean(data.featured),
      weight,
      dimensions: data.dimensions || '',
      warranty: data.warranty || '',
      certifications: data.certifications || '',
      status: data.status || 'pending'
    };
    
    const product = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Product updated successfully',
      product: {
        ...product.toObject(),
        formattedPrice: product.formattedPrice,
        discountPercentage: product.discountPercentage
      }
    });
    
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    
    // Handle validation errors
    const errObj = error as { name?: string; code?: number } | undefined;
    if (errObj && errObj.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: 'Please check all required fields' },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (errObj && errObj.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}