import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/profile/stats - Get user statistics
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'User not found' 
      }, { status: 404 });
    }

    // TODO: Replace with real data from collections when available
    // For now, generate realistic mock data based on user role and join date
    const daysSinceJoin = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const baseActivity = Math.max(1, Math.floor(daysSinceJoin / 30)); // Activity based on months since joining

    let stats;
    
    if (user.role === 'buyer') {
      stats = {
        orders: Math.floor(baseActivity * (2 + Math.random() * 3)), // 2-5 orders per month
        messages: Math.floor(baseActivity * (5 + Math.random() * 10)), // 5-15 messages per month
        products: 0, // Buyers don't have products
        revenue: Math.floor(baseActivity * (50000 + Math.random() * 200000)), // 50k-250k PKR per month
        rating: 4.2 + Math.random() * 0.7, // 4.2-4.9 rating
        reviews: Math.floor(baseActivity * (1 + Math.random() * 2)), // 1-3 reviews per month
        responseRate: 85 + Math.random() * 14, // 85-99% response rate
        responseTime: Math.random() > 0.5 ? "< 2 hours" : "< 4 hours"
      };
    } else if (user.role === 'supplier') {
      stats = {
        orders: Math.floor(baseActivity * (5 + Math.random() * 15)), // 5-20 orders per month
        messages: Math.floor(baseActivity * (10 + Math.random() * 20)), // 10-30 messages per month
        products: Math.floor(baseActivity * (3 + Math.random() * 7)), // 3-10 products per month
        revenue: Math.floor(baseActivity * (100000 + Math.random() * 400000)), // 100k-500k PKR per month
        rating: 4.0 + Math.random() * 0.9, // 4.0-4.9 rating
        reviews: Math.floor(baseActivity * (2 + Math.random() * 4)), // 2-6 reviews per month
        responseRate: 90 + Math.random() * 9, // 90-99% response rate
        responseTime: Math.random() > 0.3 ? "< 1 hour" : "< 2 hours"
      };
    } else {
      // Admin stats
      stats = {
        orders: 0,
        messages: Math.floor(baseActivity * (20 + Math.random() * 30)),
        products: 0,
        revenue: 0,
        rating: 5.0,
        reviews: 0,
        responseRate: 99,
        responseTime: "< 30 minutes"
      };
    }

    // Round rating to 1 decimal place
    stats.rating = Math.round(stats.rating * 10) / 10;
    stats.responseRate = Math.round(stats.responseRate);

    return NextResponse.json({ 
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Profile stats error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch profile statistics' 
    }, { status: 500 });
  }
}
