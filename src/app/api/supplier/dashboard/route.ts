import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import Order from '../../../../models/Order';
import Request from '../../../../models/Request';
import Offer from '../../../../models/Offer';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import type { Session } from 'next-auth';
import mongoose from 'mongoose';

// Type definitions for dashboard data
interface OrderStatusItem {
  _id: string;
  count: number;
}

interface ProductCategoryItem {
  _id: string;
  count: number;
}

interface RevenueAggregation {
  _id: null;
  total: number;
}

interface OrderProduct {
  productName: string;
  quantity: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  products: OrderProduct[];
}

interface TopProduct {
  _id: string;
  title: string;
  price: number;
  sold: number;
  views: number;
  rating: number;
  totalReviews: number;
  images: string[];
}

interface SupplierInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileSetupCompleted?: boolean;
  createdAt: Date;
  membership?: {
    tier: string;
    isActive: boolean;
  };
}

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
    const supplierObjectId = new mongoose.Types.ObjectId(session.user.id);

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
    ]: [
      number, // totalProducts
      number, // productsThisMonth
      number, // productsLastMonth
      number, // activeProducts
      number, // totalOrders
      number, // ordersThisMonth
      number, // ordersLastMonth
      number, // pendingOrders
      RevenueAggregation[], // totalRevenue
      RevenueAggregation[], // revenueThisMonth
      RevenueAggregation[], // revenueLastMonth
      RecentOrder[], // recentOrders
      number, // totalOffers
      number, // offersThisMonth
      TopProduct[], // topProducts
      SupplierInfo | null, // supplierInfo
      OrderStatusItem[], // ordersByStatus
      ProductCategoryItem[] // productsByCategory
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
      Order.countDocuments({ supplierId: supplierObjectId }),
      Order.countDocuments({ 
        supplierId: supplierObjectId,
        createdAt: { $gte: firstDayOfMonth } 
      }),
      Order.countDocuments({ 
        supplierId: supplierObjectId,
        createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
      }),
      Order.countDocuments({ 
        supplierId: supplierObjectId,
        status: { $in: ['pending', 'confirmed'] } 
      }),

      // Revenue
      Order.aggregate([
        { $match: { supplierId: supplierObjectId } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            supplierId: supplierObjectId,
            createdAt: { $gte: firstDayOfMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            supplierId: supplierObjectId,
            createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),

      // Recent orders
      Order.find({ supplierId: supplierObjectId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber buyerName buyerEmail totalAmount status createdAt products')
        .lean() as Promise<RecentOrder[]>,

      // Offers
      Offer.countDocuments({ supplierId: supplierObjectId }),
      Offer.countDocuments({ 
        supplierId: supplierObjectId,
        createdAt: { $gte: firstDayOfMonth } 
      }),

      // Top performing products
      Product.find({ 'supplier.id': supplierId })
        .sort({ sold: -1, views: -1 })
        .limit(5)
        .select('title price sold views rating totalReviews images')
        .lean() as Promise<TopProduct[]>,

      // Supplier information
      User.findById(supplierObjectId)
        .select('name email phone profileSetupCompleted createdAt membership')
        .lean() as Promise<SupplierInfo | null>,

      // Order status breakdown
      Order.aggregate([
        { $match: { supplierId: supplierObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]) as Promise<OrderStatusItem[]>,

      // Products by category
      Product.aggregate([
        { $match: { 'supplier.id': supplierId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]) as Promise<ProductCategoryItem[]>
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
    const orderStatusBreakdown = ordersByStatus.reduce((acc: Record<string, number>, item: OrderStatusItem) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Products by category breakdown
    const productCategoryBreakdown = productsByCategory.map((item: ProductCategoryItem) => ({
      category: item._id,
      count: item.count
    }));

    // Format recent orders with product info
    const formattedRecentOrders = recentOrders.map((order: RecentOrder) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      buyer: order.buyerName,
      buyerEmail: order.buyerEmail,
      product: order.products[0]?.productName || 'Multiple Products',
      qty: order.products.reduce((sum: number, p: OrderProduct) => sum + p.quantity, 0),
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
        totalViews: topProducts.reduce((sum: number, p: TopProduct) => sum + (p.views || 0), 0),
        totalSold: topProducts.reduce((sum: number, p: TopProduct) => sum + (p.sold || 0), 0),
        avgRating: topProducts.length > 0 ? 
          topProducts.reduce((sum: number, p: TopProduct) => sum + (p.rating || 0), 0) / topProducts.length : 0,
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