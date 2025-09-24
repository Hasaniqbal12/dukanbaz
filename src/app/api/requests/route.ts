import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Request from '../../../models/Request';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// GET - Fetch requests with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'open';
    const location = searchParams.get('location') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: Record<string, unknown> = {};

    // Only filter by status if it's not 'all' and not empty
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { specifications: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('API - Query:', query);
    console.log('API - Sort options:', sortOptions);
    console.log('API - Skip:', skip, 'Limit:', limit);
    
    const [requests, totalRequests] = await Promise.all([
      Request.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('buyerId', 'name email')
        .lean(),
      Request.countDocuments(query)
    ]);

    console.log('API - Found requests:', requests.length);
    console.log('API - Total requests:', totalRequests);
    console.log('API - First request:', requests[0]);

    const totalPages = Math.ceil(totalRequests / limit);

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: page,
          totalPages,
          totalRequests,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Requests API GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST - Create new request (buyers only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions); 
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Temporarily disabled for testing - any authenticated user can post requests
    // if (session.user.role !== 'buyer') {
    //   return NextResponse.json(
    //     { success: false, error: 'Only buyers can create requests' },
    //     { status: 403 }
    //   );
    // }

    await dbConnect();
    
    const requestData = await request.json();

    // Validate required fields
    const requiredFields = ['productName', 'category', 'quantity', 'targetPrice', 'description'];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate request number
    const requestNumber = `RQ${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create request
    const newRequest = new Request({
      requestNumber,
      buyerId: session.user.id,
      buyerName: session.user.name,
      buyerEmail: session.user.email,
      productName: requestData.productName,
      category: requestData.category,
      quantity: requestData.quantity,
      unit: requestData.unit || 'pieces',
      targetPrice: requestData.targetPrice,
      maxBudget: requestData.maxBudget || requestData.targetPrice * requestData.quantity,
      description: requestData.description,
      specifications: requestData.specifications || '',
      preferredBrands: requestData.preferredBrands || [],
      location: requestData.location || 'Pakistan',
      urgency: requestData.urgency || 'medium',
      contactMethod: requestData.contactMethod || 'platform',
      additionalRequirements: requestData.additionalRequirements || '',
      attachments: requestData.attachments || [],
      status: 'open',
      priority: calculatePriority(requestData),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
      updatedAt: new Date(),
      offerCount: 0,
      viewCount: 0
    });

    await newRequest.save();

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: 'Request created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create request' },
      { status: 500 }
    );
  }
}

function calculatePriority(requestData: { maxBudget?: number; quantity?: number; urgency?: string }): 'low' | 'medium' | 'high' | 'urgent' {
  let score = 0;
  
  // Budget factor
  if ((requestData.maxBudget || 0) > 100000) score += 3;
  else if ((requestData.maxBudget || 0) > 50000) score += 2;
  else if ((requestData.maxBudget || 0) > 10000) score += 1;
  
  // Quantity factor
  if ((requestData.quantity || 0) > 1000) score += 2;
  else if ((requestData.quantity || 0) > 100) score += 1;
  
  // Urgency factor
  if (requestData.urgency === 'urgent') score += 3;
  else if (requestData.urgency === 'high') score += 2;
  else if (requestData.urgency === 'medium') score += 1;
  
  if (score >= 6) return 'urgent';
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
} 
 
 
 