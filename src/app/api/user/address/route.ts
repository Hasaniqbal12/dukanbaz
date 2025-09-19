import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dbConnect } from '../../../../lib/mongodb';
import User from '../../../../models/User';

// GET - Fetch user's saved address
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user's address and basic info for auto-fill
    const addressData = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      country: user.address?.country || 'Pakistan',
      zipCode: user.address?.postalCode || ''
    };

    return NextResponse.json({ 
      success: true, 
      data: addressData,
      hasAddress: !!user.address 
    });
  } catch (error) {
    console.error('Error fetching user address:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch address' 
    }, { status: 500 });
  }
}

// POST - Save user's address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, city, state, country, zipCode } = body;

    // Validate required fields
    if (!name || !phone || !address || !city || !state || !zipCode) {
      return NextResponse.json({ 
        error: 'Missing required address fields' 
      }, { status: 400 });
    }

    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user's address and basic info
    user.name = name;
    user.phone = phone;
    user.address = {
      street: address,
      city,
      state,
      country: country || 'Pakistan',
      postalCode: zipCode
    };

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Address saved successfully' 
    });
  } catch (error) {
    console.error('Error saving user address:', error);
    return NextResponse.json({ 
      error: 'Failed to save address' 
    }, { status: 500 });
  }
}
