import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Offer from '../../../models/Offer';
import Request from '../../../models/Request';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// GET - Fetch offers with filtering
export async function GET(request: NextRequest) {
  try {
    // Temporarily disabled authentication for testing
    // const session = await getServerSession(authOptions);
    
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { success: false, error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const requestId = searchParams.get('requestId') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query - temporarily show all offers for testing
    const query: Record<string, unknown> = {};
    
    // Temporarily disabled role-based filtering for testing
    // if (session.user.role === 'buyer') {
    //   // Buyers can see offers for their requests
    //   query.buyerId = session.user.id;
    // } else if (session.user.role === 'supplier') {
    //   // Suppliers can see their own offers
    //   query.supplierId = session.user.id;
    // } else if (session.user.role === 'admin') {
    //   // Admin can see all offers
    // } else {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid user role' },
    //     { status: 403 }
    //   );
    // }

    if (requestId) {
      query.requestId = requestId;
    }

    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, number> = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [offers, totalOffers] = await Promise.all([
      Offer.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Offer.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalOffers / limit);

    return NextResponse.json({
      success: true,
      data: {
        offers,
        pagination: {
          currentPage: page,
          totalPages,
          totalOffers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

// POST - Create new offer (suppliers only)
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
        { success: false, error: 'Only suppliers can create offers' },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const offerData = await request.json();

    // Validate required fields
    const requiredFields = ['requestId', 'price', 'moq'];
    for (const field of requiredFields) {
      if (!offerData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate request exists and is open
    const targetRequest = await Request.findById(offerData.requestId);
    if (!targetRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    if (targetRequest.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'This request is no longer accepting offers' },
        { status: 400 }
      );
    }

    // Check if supplier already made an offer for this request
    const existingOffer = await Offer.findOne({
      requestId: offerData.requestId,
      supplierId: session.user.id
    });

    if (existingOffer) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted an offer for this request' },
        { status: 400 }
      );
    }

    // Create offer with only the fields that exist in the Offer model
    const newOffer = new Offer({
      requestId: offerData.requestId,
      supplierId: session.user.id,
      price: offerData.price,
      moq: offerData.moq,
      message: offerData.message || '',
      status: 'pending'
    });

    await newOffer.save();

    // Update request offer count
    await Request.findByIdAndUpdate(
      offerData.requestId,
      { 
        $inc: { offerCount: 1 },
        updatedAt: new Date()
      }
    );

    return NextResponse.json({
      success: true,
      data: newOffer,
      message: 'Offer submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}

 
 
 
 