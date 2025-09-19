import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import type { Session } from 'next-auth';

// GET - Fetch orders with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query based on user role
    const query: Record<string, unknown> = {};
    
    if (session.user.role === 'buyer') {
      query.buyerId = session.user.id;
    } else if (session.user.role === 'supplier') {
      query.supplierId = session.user.id;
    } else if (session.user.role === 'admin') {
      // Admin can see all orders
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid user role' },
        { status: 403 }
      );
    }

    // Add filters
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { buyerName: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { 'products.productName': { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        (query.createdAt as Record<string, unknown>).$gte = new Date(dateFrom);
      }
      if (dateTo) {
        (query.createdAt as Record<string, unknown>).$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'buyer') {
      return NextResponse.json(
        { success: false, error: 'Only buyers can create orders' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const orderData = await request.json();

    // Validate required fields
    const requiredFields = ['products', 'shippingAddress', 'shippingMethod'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate and calculate order totals
    let totalAmount = 0;
    const validatedProducts = [];
    let supplier = null;

    for (const item of orderData.products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      // Check MOQ
      const moqValue = parseInt(product.moq) || 1;
      if (item.quantity < moqValue) {
        return NextResponse.json(
          { success: false, error: `Minimum order quantity for ${product.title} is ${moqValue}` },
          { status: 400 }
        );
      }

      // Check availability
      if (item.quantity > product.available) {
        return NextResponse.json(
          { success: false, error: `Only ${product.available} pieces available for ${product.title}` },
          { status: 400 }
        );
      }

      // Calculate price based on quantity tiers
      let unitPrice = product.price;
      if (product.priceTiers && product.priceTiers.length > 0) {
        for (const tier of product.priceTiers) {
          if (item.quantity >= tier.minQty && (!tier.maxQty || item.quantity <= tier.maxQty)) {
            unitPrice = tier.price;
            break;
          }
        }
      }

      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      // Set supplier (assume single supplier per order)
      if (!supplier) {
        supplier = product.supplier;
      }

      validatedProducts.push({
        productId: product._id.toString(),
        productName: product.title,
        productImage: product.images[0] || '',
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
        specifications: item.specifications || '',
        // Preserve variation data from cart
        variantId: item.variantId || '',
        variantName: item.variantName || '',
        color: item.color || '',
        size: item.size || '',
        material: item.material || '',
        style: item.style || '',
        variationAttributes: item.variationAttributes || []
      });
    }

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'No valid supplier found' },
        { status: 400 }
      );
    }

    // Get buyer information
    const buyer = await User.findById(session.user.id);
    if (!buyer) {
      return NextResponse.json(
        { success: false, error: 'Buyer not found' },
        { status: 400 }
      );
    }

    // Create order
    const order = new Order({
      buyerId: session.user.id,
      buyerName: buyer.name || session.user.name || '',
      buyerEmail: buyer.email || session.user.email || '',
      buyerPhone: buyer.phone || orderData.buyerPhone || '',
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierEmail: supplier.email,
      products: validatedProducts,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: orderData.shippingAddress,
      shippingMethod: orderData.shippingMethod || 'Standard Shipping',
      estimatedDelivery: orderData.estimatedDelivery || '7-10 business days',
      notes: orderData.notes || ''
    });

    await order.save();

    // Update product availability
    for (const item of validatedProducts) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { available: -item.quantity, sold: item.quantity } }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 
 
 
 