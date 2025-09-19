import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Product from '../../../../models/Product';
import Order from '../../../../models/Order';
import Request from '../../../../models/Request';
import Offer from '../../../../models/Offer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import type { Session } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get current date and last month date for comparisons
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for better performance
    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      totalProducts,
      productsThisMonth,
      productsLastMonth,
      activeProducts,
      totalOrders,
      ordersThisMonth,
      ordersLastMonth,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      totalRequests,
      requestsThisMonth,
      requestsLastMonth,
      totalOffers,
      offersThisMonth,
      offersLastMonth,
      verifiedSuppliers,
      pendingUsers,
      ordersByStatus,
      recentActivity
    ] = await Promise.all([
      // Users
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      User.countDocuments({ 
        createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
      }),

      // Products
      Product.countDocuments(),
      Product.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Product.countDocuments({ 
        createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
      }),
      Product.countDocuments({ status: 'active' }),

      // Orders
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Order.countDocuments({ 
        createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
      }),

      // Revenue
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: firstDayOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),

      // Requests
      Request.countDocuments(),
      Request.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Request.countDocuments({ 
        createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
      }),

      // Offers
      Offer.countDocuments(),
      Offer.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Offer.countDocuments({ 
        createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
      }),

      // Suppliers and approvals
      User.countDocuments({ role: 'supplier', profileSetupCompleted: true }),
      User.countDocuments({ profileSetupCompleted: false }),

      // Order status breakdown
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Recent activity (last 10 items across all types)
      Promise.all([
        User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean(),
        Order.find().sort({ createdAt: -1 }).limit(5).select('orderNumber buyerName totalAmount status createdAt').lean(),
        Product.find().sort({ createdAt: -1 }).limit(5).select('title supplier.name price status createdAt').lean()
      ])
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userGrowth = calculateGrowth(usersThisMonth, usersLastMonth);
    const productGrowth = calculateGrowth(productsThisMonth, productsLastMonth);
    const orderGrowth = calculateGrowth(ordersThisMonth, ordersLastMonth);
    const requestGrowth = calculateGrowth(requestsThisMonth, requestsLastMonth);
    const offerGrowth = calculateGrowth(offersThisMonth, offersLastMonth);

    // Revenue calculations
    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    const revenueThisMonthAmount = revenueThisMonth[0]?.total || 0;
    const revenueLastMonthAmount = revenueLastMonth[0]?.total || 0;
    const revenueGrowth = calculateGrowth(revenueThisMonthAmount, revenueLastMonthAmount);

    // Order status breakdown
    const orderStatusBreakdown = ordersByStatus.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Format recent activity
    const [recentUsers, recentOrders, recentProducts] = recentActivity;
    const formattedActivity = [
      ...recentUsers.map((user: any) => ({
        type: 'user',
        id: user._id,
        title: `New ${user.role} registered`,
        subtitle: user.name,
        timestamp: user.createdAt
      })),
      ...recentOrders.map((order: any) => ({
        type: 'order',
        id: order._id,
        title: `Order ${order.orderNumber}`,
        subtitle: `${order.buyerName} - PKR ${order.totalAmount.toLocaleString()}`,
        timestamp: order.createdAt
      })),
      ...recentProducts.map((product: any) => ({
        type: 'product',
        id: product._id,
        title: product.title,
        subtitle: `By ${product.supplier?.name || 'Unknown'} - PKR ${product.price}`,
        timestamp: product.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    const stats = {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRequests,
        totalOffers,
        totalRevenue: totalRevenueAmount,
        verifiedSuppliers,
        pendingApprovals: pendingUsers,
        activeProducts
      },
      growth: {
        users: userGrowth,
        products: productGrowth,
        orders: orderGrowth,
        requests: requestGrowth,
        offers: offerGrowth,
        revenue: revenueGrowth
      },
      thisMonth: {
        users: usersThisMonth,
        products: productsThisMonth,
        orders: ordersThisMonth,
        requests: requestsThisMonth,
        offers: offersThisMonth,
        revenue: revenueThisMonthAmount
      },
      orderStatus: orderStatusBreakdown,
      recentActivity: formattedActivity,
      platformHealth: {
        activeProducts,
        totalProducts,
        verifiedSuppliers,
        totalUsers,
        conversionRate: totalProducts > 0 ? Math.round((totalOrders / totalProducts) * 100) : 0,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenueAmount / totalOrders) : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 