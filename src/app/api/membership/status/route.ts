import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Default membership for users without one
    const defaultMembership = {
      tier: 'basic',
      isActive: true,
      features: {
        dropshippingAccess: false,
        bulkOrderDiscount: false,
        prioritySupport: false,
        customBranding: false,
        advancedAnalytics: false
      }
    };

    const membership = user.membership || defaultMembership;
    
    // Check if membership is expired
    const now = new Date();
    const isExpired = membership.endDate && membership.endDate < now;

    return NextResponse.json({
      membership: {
        ...membership,
        isActive: membership.isActive && !isExpired,
        isExpired
      },
      hasDropshippingAccess: user.hasDropshippingAccess ? user.hasDropshippingAccess() : false
    });

  } catch (error) {
    console.error('Membership status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
