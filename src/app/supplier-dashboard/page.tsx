"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PageLayout from "../../components/PageLayout";
import {
  FiBarChart,
  FiShoppingBag,
  FiDollarSign,
  FiClipboard,
  FiUser,
  FiMessageCircle,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiGrid,
  FiActivity,
  FiX,
  FiMenu,
  FiBell,
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiShoppingCart,
  FiArrowUpRight,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiStar,
  FiShield
} from "react-icons/fi";
import SupplierMembershipUpgrade from '../../components/SupplierMembershipUpgrade';

interface SupplierStats {
  overview: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalOffers: number;
  };
  growth: {
    products: number;
    orders: number;
    revenue: number;
    offers: number;
  };
  lastMonth: {
    products: number;
    orders: number;
    revenue: number;
    offers: number;
  };
  thisMonth: {
    products: number;
    orders: number;
    revenue: number;
    offers: number;
  };
  supplierInfo: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profileSetupCompleted: boolean;
    createdAt: string;
    membership?: {
      tier: string;
      hasDropshippingAccess: boolean;
      startDate: string;
      endDate?: string;
    };
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    buyer: string;
    product: string;
    qty: number;
    value: number;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    _id: string;
    title: string;
    sales: number;
    revenue: number;
    image?: string;
    views: number;
    sold: number;
    rating: number;
    price: number;
  }>;
  analytics: {
    totalRevenue: number;
    totalOrders: number;
    productsListed: number;
    averageRating: number;
    monthlyGrowth: number;
    orderGrowth: number;
    revenueGrowth: number;
    avgOrderValue: number;
    conversionRate: number;
  };
  performance: {
    totalViews: number;
    totalSold: number;
    avgRating: number;
    conversionRate: number;
  };
  orderStatus: {
    [key: string]: number;
  };
  productCategories: Array<{
    category: string;
    count: number;
  }>;
}

export default function SupplierDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMembershipUpgrade, setShowMembershipUpgrade] = useState(false);

  // Check authentication and role
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signin?callbackUrl=/supplier-dashboard');
      return;
    }
    
    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    if (extendedSession?.user?.role !== 'supplier') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Fetch supplier dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/supplier/dashboard");
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError("Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Error loading dashboard data");
      console.error("Error fetching supplier dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle membership upgrade
  const handleMembershipUpgrade = async () => {
    try {
      // Refresh dashboard data to get updated membership status
      await fetchDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard after upgrade:', error);
    }
  };

  useEffect(() => {
    const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
    if (extendedSession?.user?.role === 'supplier') {
      fetchDashboardData();
    }
  }, [session]);



  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || (session as typeof session & { user?: { role?: string } })?.user?.role !== 'supplier') {
    return null;
  }

  const statCards = stats ? [
    {
      label: "Total Revenue",
      value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : "$0",
      icon: <FiDollarSign className="w-6 h-6" />,
      gradient: "from-emerald-400 to-green-600",
      bgGradient: "from-white to-emerald-50",
      iconBg: "bg-gradient-to-r from-emerald-500 to-green-600",
      change: { value: "+12.5%", trend: "up" as const }
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: <FiShoppingCart className="w-6 h-6" />,
      gradient: "from-blue-400 to-indigo-600",
      bgGradient: "from-white to-blue-50",
      iconBg: "bg-gradient-to-r from-blue-500 to-indigo-600",
      change: { value: "+8.2%", trend: "up" as const }
    },
    {
      label: "Products Listed",
      value: stats?.productsListed || 0,
      icon: <FiPackage className="w-6 h-6" />,
      gradient: "from-purple-400 to-violet-600",
      bgGradient: "from-white to-purple-50",
      iconBg: "bg-gradient-to-r from-purple-500 to-violet-600",
      change: { value: "+3.1%", trend: "up" as const }
    },
    {
      label: "Avg Rating",
      value: stats?.averageRating ? `${stats.averageRating.toFixed(1)}★` : "0★",
      icon: <FiTrendingUp className="w-6 h-6" />,
      gradient: "from-amber-400 to-orange-600",
      bgGradient: "from-white to-amber-50",
      iconBg: "bg-gradient-to-r from-amber-500 to-orange-600",
      change: { value: "+0.3", trend: "up" as const }
    }
  ] : [];

  const supplierName = stats?.supplierInfo?.name || session.user?.name || "Supplier";

  return (
    
      <div className="min-h-screen bg-gray-50 flex">
        {/* Modern Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-white">
            <h1 className="text-lg font-semibold text-gray-900">
              DukanBaz
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-6 space-y-1">
            <Link href="/supplier-dashboard" className="bg-gray-100 text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <FiBarChart className="text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
              Dashboard
            </Link>
            
            <Link href="/add-product" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <FiPlus className="text-gray-400 group-hover:text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
              Add Product
            </Link>
            
            <Link href="/seller/manage-products" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <FiGrid className="text-gray-400 group-hover:text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
              Manage Products
            </Link>
            
            <Link href="/seller/orders" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <FiClipboard className="text-gray-400 group-hover:text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
              Orders
            </Link>
            
            <Link href="/chat" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <FiMessageCircle className="text-gray-400 group-hover:text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
              Messages
              <span className="ml-auto bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full">3</span>
            </Link>
            
            <Link href="/profile" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <FiUser className="text-gray-400 group-hover:text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
              Profile
            </Link>

            {!stats?.supplierInfo?.profileSetupCompleted && (
              <Link href="/profile/supplier-setup" className="text-orange-700 bg-orange-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                <FiSettings className="text-orange-500 mr-3 flex-shrink-0 h-4 w-4" />
                Complete Profile Setup
                <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">!</span>
              </Link>
            )}
            
            <Link href="/settings" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <FiSettings className="text-gray-400 group-hover:text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
              Settings
            </Link>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 w-full p-6">
            <button 
              onClick={() => router.push('/api/auth/signout')}
              className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <FiLogOut className="text-gray-400 group-hover:text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white">
            <div className="py-6 px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden -ml-0.5 -mt-0.5 h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
                  >
                    <FiMenu className="h-5 w-5" />
                  </button>
                  <div className="lg:ml-0 ml-4">
                    <h1 className="text-xl font-semibold text-gray-900">Welcome back, {supplierName}</h1>
                    <p className="text-sm text-gray-600 mt-1">Here&apos;s what&apos;s happening with your business today</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={fetchDashboardData}
                    className="p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <FiRefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 rounded hover:bg-gray-100 transition-colors relative">
                    <FiBell className="w-4 h-4 text-gray-600" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="px-4 sm:px-6 lg:px-8">
                
                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <FiAlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Membership Status Section */}
                {stats?.supplierInfo?.membership && (
                  <div className="mb-6">
                    <div className="bg-white rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            {stats.supplierInfo.membership.tier === 'premium' ? (
                              <FiStar className="w-4 h-4 text-gray-600" />
                            ) : stats.supplierInfo.membership.tier === 'enterprise' ? (
                              <FiShield className="w-4 h-4 text-gray-600" />
                            ) : (
                              <FiUser className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-gray-900 capitalize">
                              {stats.supplierInfo.membership.tier} Membership
                            </h3>
                            <p className="text-xs text-gray-500">
                              {stats.supplierInfo.membership.tier === 'basic' 
                                ? 'Upgrade to unlock dropshipping features'
                                : 'You have access to all dropshipping features'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {stats.supplierInfo.membership.tier === 'basic' && (
                          <button
                            onClick={() => setShowMembershipUpgrade(true)}
                            className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition-colors flex items-center space-x-1"
                          >
                            <FiArrowUpRight className="w-3 h-3" />
                            <span>Upgrade</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            {stats.supplierInfo.membership.hasDropshippingAccess ? (
                              <FiCheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <FiX className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <span className="text-gray-600">Dropshipping</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            {stats.supplierInfo.membership.tier !== 'basic' ? (
                              <FiCheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <FiX className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <span className="text-gray-600">Priority Support</span>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            {stats.supplierInfo.membership.tier === 'enterprise' ? (
                              <FiCheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <FiX className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <span className="text-gray-600">Advanced Features</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    statCards.map((stat, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                            <div className="text-gray-600">
                              {stat.icon}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                          <p className="text-xl font-semibold text-gray-900 mb-1">
                            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            {stat.change.trend === 'up' ? <FiTrendingUp className="w-3 h-3 mr-1" /> : 
                             stat.change.trend === 'down' ? <FiTrendingDown className="w-3 h-3 mr-1" /> : 
                             <FiActivity className="w-3 h-3 mr-1" />}
                            {stat.change.value}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent Orders and Top Products */}
                {stats && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg">
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Recent Orders</h3>
                          <Link 
                            href="/seller/orders"
                            className="text-gray-600 hover:text-gray-900 text-xs flex items-center"
                          >
                            View all
                            <FiArrowUpRight className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                      <div className="px-4 pb-4 space-y-3">
                        {stats.recentOrders.slice(0, 4).map((order) => (
                          <div key={order._id} className="hover:bg-gray-50 p-2 rounded transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs font-medium text-gray-900">{order.orderNumber}</p>
                                  <span className="text-xs text-gray-500">{order.status}</span>
                                </div>
                                <p className="text-xs text-gray-600">{order.buyer}</p>
                                <p className="text-xs text-gray-500">{order.product} × {order.qty}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium text-gray-900">PKR {order.value.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {stats.recentOrders.length === 0 && (
                          <div className="px-4 py-6 text-center text-gray-500">
                            <FiShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs">No orders yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-lg">
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Top Products</h3>
                          <Link 
                            href="/seller/manage-products"
                            className="text-gray-600 hover:text-gray-900 text-xs flex items-center"
                          >
                            Manage all
                            <FiArrowUpRight className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                      <div className="px-4 pb-4 space-y-3">
                        {stats.topProducts.slice(0, 4).map((product) => (
                          <div key={product._id} className="hover:bg-gray-50 p-2 rounded transition-colors">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <Image
                                  className="h-8 w-8 rounded object-cover"
                                  src={product.image || '/placeholder-product.jpg'}
                                  alt={product.title}
                                  width={32}
                                  height={32}
                                />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-xs font-medium text-gray-900 truncate">{product.title}</p>
                                <div className="flex items-center text-xs text-gray-500 space-x-2">
                                  <span>{product.views} views</span>
                                  <span>{product.sold} sold</span>
                                  <span>★ {product.rating.toFixed(1)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium text-gray-900">PKR {product.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {stats.topProducts.length === 0 && (
                          <div className="px-4 py-6 text-center text-gray-500">
                            <FiPackage className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs mb-2">No products yet</p>
                            <Link 
                              href="/add-product"
                              className="text-gray-600 hover:text-gray-900 text-xs"
                            >
                              Add your first product
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Overview */}
                {stats && (
                  <div className="bg-white rounded-lg">
                    <div className="px-4 py-3">
                      <h3 className="text-sm font-medium text-gray-900">Performance Overview</h3>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{stats.performance.totalViews.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Total Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{stats.performance.totalSold.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Total Sold</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{stats.performance.avgRating.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">Average Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{stats.performance.conversionRate}%</div>
                          <div className="text-xs text-gray-500">Conversion Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      
    
  );
} 
