import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, paymentMethod, transactionId, amount } = await req.json();

    // Validate tier
    if (!['premium', 'enterprise'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Define membership features based on tier
    const membershipFeatures = {
      premium: {
        dropshippingAccess: true,
        bulkOrderDiscount: true,
        prioritySupport: true,
        customBranding: false,
        advancedAnalytics: false
      },
      enterprise: {
        dropshippingAccess: true,
        bulkOrderDiscount: true,
        prioritySupport: true,
        customBranding: true,
        advancedAnalytics: true
      }
    };

    // Calculate end date (1 year from now)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Update user membership
    const membershipUpdate = {
      tier,
      startDate: new Date(),
      endDate,
      isActive: true,
      features: membershipFeatures[tier as keyof typeof membershipFeatures],
      paymentHistory: [
        ...(user.membership?.paymentHistory || []),
        {
          amount,
          currency: 'USD',
          paymentDate: new Date(),
          paymentMethod,
          transactionId
        }
      ]
    };

    await User.findByIdAndUpdate(user._id, {
      membership: membershipUpdate
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upgraded to ${tier} membership`,
      membership: membershipUpdate
    });

  } catch (error) {
    console.error('Membership upgrade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
