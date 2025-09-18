import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Get user's orders
    const userOrders = await Order.find({
      $or: [
        { buyerId: session.user.id },
        { supplierId: session.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Count pending orders
    const pendingOrdersCount = await Order.countDocuments({
      $or: [
        { buyerId: session.user.id },
        { supplierId: session.user.id }
      ],
      status: { $in: ['pending', 'confirmed'] }
    });

    // Get recent messages (placeholder - you can implement Message model later)
    const recentMessages = [];
    const unreadMessagesCount = 0;

    // Format orders for frontend
    const formattedOrders = userOrders.map(order => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber || `WH-${order._id.toString().slice(-6).toUpperCase()}`,
      status: order.status || 'pending',
      createdAt: order.createdAt || new Date().toISOString(),
      items: order.products?.map(product => ({
        productName: product.productName || 'Product'
      })) || []
    }));

    const dashboardData = {
      orders: {
        pendingCount: pendingOrdersCount,
        recent: formattedOrders
      },
      messages: {
        unreadCount: unreadMessagesCount,
        recent: recentMessages
      },
      cart: {
        summary: {
          totalItems: 0,
          totalAmount: 0
        },
        items: []
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
