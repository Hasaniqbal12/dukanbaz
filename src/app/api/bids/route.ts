import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { dbConnect } from '../../../lib/mongodb';
import Bid from '../../../models/Bid';
import Request from '../../../models/Request';
import Product from '../../../models/Product';
import User from '../../../models/User';

// GET /api/bids - Get bids (for buyer to see bids on their requests, or supplier to see their bids)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const supplierId = searchParams.get('supplierId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};

    // If requestId is provided, get all bids for that request
    if (requestId) {
      console.log('API - Filtering bids by requestId:', requestId);
      query.request = requestId;
    }

    // If supplierId is provided, get all bids by that supplier
    if (supplierId) {
      if (supplierId === 'me') {
        // Get current user's supplier ID
        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        query.supplier = currentUser._id;
      } else {
        query.supplier = supplierId;
      }
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    console.log('API - Query:', query);
    
    const bids = await Bid.find(query)
      .populate('supplier', 'name email profileImage companyName verified')
      .populate('product', 'name images price category')
      .populate('request', 'productName quantity targetPrice maxBudget')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('API - Found bids:', bids.length);
    console.log('API - First bid:', bids[0]);

    const total = await Bid.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        bids,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}

// POST /api/bids - Create a new bid
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { 
      requestId, 
      productId, 
      bidPrice, 
      quantity, 
      message, 
      deliveryTime 
    } = body;

    // Validate required fields
    if (!requestId || !productId || !bidPrice || !quantity || !deliveryTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get supplier info
    const supplier = await User.findOne({ email: session.user.email });
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    // Check if supplier role is correct
    if (supplier.role !== 'supplier') {
      return NextResponse.json(
        { error: 'Only suppliers can create bids' },
        { status: 403 }
      );
    }

    // Check if request exists and is open for bidding
    const requestDoc = await Request.findById(requestId);
    if (!requestDoc) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (requestDoc.status !== 'open') {
      return NextResponse.json(
        { error: 'Request is not open for bidding' },
        { status: 400 }
      );
    }

    // Check if request has expired
    if (new Date() > requestDoc.expiresAt) {
      return NextResponse.json(
        { error: 'Request has expired' },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to supplier
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

         if (product.supplier.id !== supplier._id.toString()) {
       return NextResponse.json(
         { error: 'Product does not belong to you' },
         { status: 403 }
       );
     }

    // Check if supplier already has a bid for this request
    const existingBid = await Bid.findOne({
      request: requestId,
      supplier: supplier._id
    });

    if (existingBid) {
      return NextResponse.json(
        { error: 'You have already placed a bid on this request' },
        { status: 400 }
      );
    }

    // Create the bid
    const bid = new Bid({
      request: requestId,
      supplier: supplier._id,
      product: productId,
      bidPrice: parseFloat(bidPrice),
             originalPrice: product.price,
      quantity: parseInt(quantity),
      message: message || '',
      deliveryTime: parseInt(deliveryTime),
      status: 'pending'
    });

    await bid.save();

    // Update bid count only, don't change status
    await Request.findByIdAndUpdate(requestId, {
      $inc: { bidCount: 1 }
    });

    // Populate the bid before returning
    await bid.populate('supplier', 'name email profileImage companyName verified');
    await bid.populate('product', 'name images price category');
    await bid.populate('request', 'productName quantity targetPrice maxBudget');

    return NextResponse.json({
      success: true,
      message: 'Bid created successfully',
      data: bid
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating bid:', error);
    return NextResponse.json(
      { error: 'Failed to create bid' },
      { status: 500 }
    );
  }
}