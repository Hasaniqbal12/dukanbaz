"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
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
  FiMoreVertical,
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiShoppingCart,
  FiArrowUpRight,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTruck,
  FiRefreshCw,
  FiStar,
  FiShield
} from "react-icons/fi";
import SupplierMembershipUpgrade from "@/components/SupplierMembershipUpgrade";

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
  const handleMembershipUpgrade = async (tier: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'confirmed': return <FiCheckCircle className="w-4 h-4" />;
      case 'processing': return <FiPackage className="w-4 h-4" />;
      case 'shipped': return <FiTruck className="w-4 h-4" />;
      case 'delivered': return <FiCheckCircle className="w-4 h-4" />;
      case 'cancelled': return <FiAlertCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const getVariationDisplay = (order: any) => {
    if (!order.products || order.products.length === 0) return '';
    
    const product = order.products[0];
    const variations = [];
    
    if (product.color && product.color !== 'default') variations.push(product.color);
    if (product.size && product.size !== 'default') variations.push(product.size);
    if (product.material && product.material !== 'default') variations.push(product.material);
    if (product.style && product.style !== 'default') variations.push(product.style);
    
    // Use variationAttributes if available
    if (product.variationAttributes && product.variationAttributes.length > 0) {
      const attrs = product.variationAttributes.map((attr: any) => attr.value).filter((val: string) => val && val !== 'default');
      variations.push(...attrs);
    }
    
    return variations.length > 0 ? ` (${variations.join(', ')})` : '';
  };

  const formatGrowth = (growth: number) => {
    if (growth > 0) {
      return { value: `+${growth}%`, trend: 'up', color: 'text-green-600' };
    } else if (growth < 0) {
      return { value: `${growth}%`, trend: 'down', color: 'text-red-600' };
    } else {
      return { value: '0%', trend: 'neutral', color: 'text-gray-600' };
    }
  };

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

  if (!session || (session as any)?.user?.role !== 'supplier') {
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
    <PageLayout
      title="Supplier Dashboard - WholesaleHub"
      description="Manage your products, orders, and business analytics"
      showHeader={true}
      showFooter={false}
      showMegaMenu={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
        {/* Modern Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-white/20 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h1 className="text-xl font-bold text-white">
              <span className="text-white">Wholesale</span><span className="text-yellow-300">Hub</span>
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-4 space-y-2">
            <Link href="/supplier-dashboard" className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 group flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:shadow-md transition-all duration-200">
              <FiBarChart className="text-indigo-600 mr-3 flex-shrink-0 h-5 w-5" />
              Dashboard
            </Link>
            
            <Link href="/add-product" className="text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-indigo-700 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200">
              <FiPlus className="text-gray-400 group-hover:text-indigo-500 mr-3 flex-shrink-0 h-5 w-5" />
              Add Product
            </Link>
            
            <Link href="/seller/manage-products" className="text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-indigo-700 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200">
              <FiGrid className="text-gray-400 group-hover:text-indigo-500 mr-3 flex-shrink-0 h-5 w-5" />
              Manage Products
            </Link>
            
            <Link href="/seller/orders" className="text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-indigo-700 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200">
              <FiClipboard className="text-gray-400 group-hover:text-indigo-500 mr-3 flex-shrink-0 h-5 w-5" />
              Orders
            </Link>
            
            <Link href="/chat" className="text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-indigo-700 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200">
              <FiMessageCircle className="text-gray-400 group-hover:text-indigo-500 mr-3 flex-shrink-0 h-5 w-5" />
              Messages
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
            </Link>
            
            <Link href="/profile" className="text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-indigo-700 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200">
              <FiUser className="text-gray-400 group-hover:text-indigo-500 mr-3 flex-shrink-0 h-5 w-5" />
              Profile
            </Link>

            {!stats?.supplierInfo?.profileSetupCompleted && (
              <Link href="/profile/supplier-setup" className="text-orange-700 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 hover:shadow-md group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200">
                <FiSettings className="text-orange-500 mr-3 flex-shrink-0 h-5 w-5" />
                Complete Profile Setup
                <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">!</span>
              </Link>
            )}
            
            <Link href="/settings" className="text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-indigo-700 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200">
              <FiSettings className="text-gray-400 group-hover:text-indigo-500 mr-3 flex-shrink-0 h-5 w-5" />
              Settings
            </Link>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
            <button 
              onClick={() => router.push('/api/auth/signout')}
              className="w-full text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
            >
              <FiLogOut className="text-gray-400 group-hover:text-red-500 mr-3 flex-shrink-0 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  >
                    <FiMenu className="h-6 w-6" />
                  </button>
                  <div className="lg:ml-0 ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {supplierName}!</h1>
                    <p className="text-gray-600">Here&apos;s what&apos;s happening with your business today</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={fetchDashboardData}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiRefreshCw className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                    <FiBell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                  <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              stats.supplierInfo.membership.tier === 'premium' ? 'bg-blue-100' :
                              stats.supplierInfo.membership.tier === 'enterprise' ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                              {stats.supplierInfo.membership.tier === 'premium' ? (
                                <FiStar className={`w-5 h-5 ${
                                  stats.supplierInfo.membership.tier === 'premium' ? 'text-blue-600' : 'text-gray-600'
                                }`} />
                              ) : stats.supplierInfo.membership.tier === 'enterprise' ? (
                                <FiShield className="w-5 h-5 text-purple-600" />
                              ) : (
                                <FiUser className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                {stats.supplierInfo.membership.tier} Membership
                              </h3>
                              <p className="text-sm text-gray-600">
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
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
                            >
                              <FiArrowUpRight className="w-4 h-4" />
                              <span>Upgrade Now</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Dropshipping Access</span>
                              {stats.supplierInfo.membership.hasDropshippingAccess ? (
                                <FiCheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <FiX className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {stats.supplierInfo.membership.hasDropshippingAccess 
                                ? 'You can offer dropshipping services'
                                : 'Upgrade to offer dropshipping'
                              }
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Priority Support</span>
                              {stats.supplierInfo.membership.tier !== 'basic' ? (
                                <FiCheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <FiX className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {stats.supplierInfo.membership.tier !== 'basic'
                                ? 'Priority customer support'
                                : 'Standard support only'
                              }
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Advanced Features</span>
                              {stats.supplierInfo.membership.tier === 'enterprise' ? (
                                <FiCheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <FiX className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {stats.supplierInfo.membership.tier === 'enterprise'
                                ? 'API access, white-label options'
                                : 'Enterprise features not available'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modern Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  {loading ? (
                    // Enhanced Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-20"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 animate-pulse">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    statCards.map((stat, index) => (
                      <div key={index} className="group relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                        <div className={`relative bg-gradient-to-br ${stat.bgGradient} border border-white/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center text-white shadow-lg`}>
                              {stat.icon}
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mb-2">
                              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                            </p>
                            
                            <div className={`flex items-center text-sm font-semibold ${
                              stat.change.trend === 'up' ? 'text-green-600' : 
                              stat.change.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {stat.change.trend === 'up' ? <FiTrendingUp className="w-4 h-4 mr-1" /> : 
                               stat.change.trend === 'down' ? <FiTrendingDown className="w-4 h-4 mr-1" /> : 
                               <FiActivity className="w-4 h-4 mr-1" />}
                              {stat.change.value}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent Orders and Top Products */}
                {stats && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Recent Orders */}
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                          <Link 
                            href="/seller/orders"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                          >
                            View all
                            <FiArrowUpRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {stats.recentOrders.slice(0, 5).map((order) => (
                          <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1">{order.status}</span>
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{order.buyer}</p>
                                <p className="text-xs text-gray-500">{order.product}{getVariationDisplay(order)} × {order.qty}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">PKR {order.value.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {stats.recentOrders.length === 0 && (
                          <div className="px-6 py-8 text-center text-gray-500">
                            <FiShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No orders yet</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white shadow rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
                          <Link 
                            href="/seller/manage-products"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                          >
                            Manage all
                            <FiArrowUpRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {stats.topProducts.map((product) => (
                          <div key={product._id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={product.images[0] || '/placeholder-product.jpg'}
                                  alt={product.title}
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <span>{product.views} views</span>
                                  <span className="mx-1">•</span>
                                  <span>{product.sold} sold</span>
                                  <span className="mx-1">•</span>
                                  <span>★ {product.rating.toFixed(1)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">PKR {product.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {stats.topProducts.length === 0 && (
                          <div className="px-6 py-8 text-center text-gray-500">
                            <FiPackage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No products yet</p>
                            <Link 
                              href="/add-product"
                              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
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
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.performance.totalViews.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Total Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.performance.totalSold.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Total Sold</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{stats.performance.avgRating.toFixed(1)}</div>
                          <div className="text-sm text-gray-500">Average Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{stats.performance.conversionRate}%</div>
                          <div className="text-sm text-gray-500">Conversion Rate</div>
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

      {/* Membership Upgrade Modal */}
      {showMembershipUpgrade && (
        <SupplierMembershipUpgrade
          onClose={() => setShowMembershipUpgrade(false)}
          onUpgrade={handleMembershipUpgrade}
          currentTier={stats?.supplierInfo?.membership?.tier || 'basic'}
        />
      )}
    </PageLayout>
  );
} 
