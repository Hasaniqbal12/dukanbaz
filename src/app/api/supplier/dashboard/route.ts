import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import Request from '../../../models/Request';
import Offer from '../../../models/Offer';
import User from '../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
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

    if (session.user.role !== 'supplier') {
      return NextResponse.json(
        { success: false, error: 'Supplier access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const supplierId = session.user.id;

    // Get current date and last month date for comparisons
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for better performance
    const [
      totalProducts,
      productsThisMonth,
      productsLastMonth,
      activeProducts,
      totalOrders,
      ordersThisMonth,
      ordersLastMonth,
      pendingOrders,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      recentOrders,
      totalOffers,
      offersThisMonth,
      topProducts,
      supplierInfo,
      ordersByStatus,
      productsByCategory
    ] = await Promise.all([
      // Products
      Product.countDocuments({ 'supplier.id': supplierId }),
      Product.countDocuments({ 
        'supplier.id': supplierId,
        createdAt: { $gte: firstDayOfMonth } 
      }),
      Product.countDocuments({ 
        'supplier.id': supplierId,
        createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
      }),
      Product.countDocuments({ 
        'supplier.id': supplierId,
        status: 'active' 
      }),

      // Orders
      Order.countDocuments({ supplierId }),
      Order.countDocuments({ 
        supplierId,
        createdAt: { $gte: firstDayOfMonth } 
      }),
      Order.countDocuments({ 
        supplierId,
        createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
      }),
      Order.countDocuments({ 
        supplierId,
        status: { $in: ['pending', 'confirmed'] } 
      }),

      // Revenue
      Order.aggregate([
        { $match: { supplierId } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            supplierId,
            createdAt: { $gte: firstDayOfMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            supplierId,
            createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),

      // Recent orders
      Order.find({ supplierId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber buyerName buyerEmail totalAmount status createdAt products')
        .lean(),

      // Offers
      Offer.countDocuments({ supplierId }),
      Offer.countDocuments({ 
        supplierId,
        createdAt: { $gte: firstDayOfMonth } 
      }),

      // Top performing products
      Product.find({ 'supplier.id': supplierId })
        .sort({ sold: -1, views: -1 })
        .limit(5)
        .select('title price sold views rating totalReviews images')
        .lean(),

      // Supplier information
      User.findById(supplierId)
        .select('name email phone profileSetupCompleted createdAt membership')
        .lean(),

      // Order status breakdown
      Order.aggregate([
        { $match: { supplierId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Products by category
      Product.aggregate([
        { $match: { 'supplier.id': supplierId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const productGrowth = calculateGrowth(productsThisMonth, productsLastMonth);
    const orderGrowth = calculateGrowth(ordersThisMonth, ordersLastMonth);

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

    // Products by category breakdown
    const productCategoryBreakdown = productsByCategory.map((item: any) => ({
      category: item._id,
      count: item.count
    }));

    // Format recent orders with product info
    const formattedRecentOrders = recentOrders.map((order: any) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      buyer: order.buyerName,
      buyerEmail: order.buyerEmail,
      product: order.products[0]?.productName || 'Multiple Products',
      qty: order.products.reduce((sum: number, p: any) => sum + p.quantity, 0),
      value: order.totalAmount,
      status: order.status,
      date: order.createdAt,
      productCount: order.products.length
    }));

    const stats = {
      overview: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenueAmount,
        totalOffers
      },
      growth: {
        products: productGrowth,
        orders: orderGrowth,
        revenue: revenueGrowth,
        offers: calculateGrowth(offersThisMonth, 0) // No previous data for offers
      },
      thisMonth: {
        products: productsThisMonth,
        orders: ordersThisMonth,
        revenue: revenueThisMonthAmount,
        offers: offersThisMonth
      },
      recentOrders: formattedRecentOrders,
      topProducts,
      orderStatus: orderStatusBreakdown,
      productCategories: productCategoryBreakdown,
      supplierInfo,
      performance: {
        totalViews: topProducts.reduce((sum: number, p: any) => sum + (p.views || 0), 0),
        totalSold: topProducts.reduce((sum: number, p: any) => sum + (p.sold || 0), 0),
        avgRating: topProducts.length > 0 ? 
          topProducts.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / topProducts.length : 0,
        conversionRate: totalProducts > 0 ? Math.round((totalOrders / totalProducts) * 100) : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching supplier dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supplier dashboard statistics' },
      { status: 500 }
    );
  }
} 