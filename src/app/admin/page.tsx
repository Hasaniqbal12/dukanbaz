"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  FiUsers,
  FiPackage,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiShield,
  FiTrash2,
  FiEdit3,
  FiEye,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiBarChart,
  FiAlertCircle,
  FiActivity
} from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: string;
  lastLogin: string;
}

interface Product {
  _id: string;
  title: string;
  category: string;
  supplier: {
    name: string;
  };
  price: number;
  status: string;
  createdAt: string;
}

interface Request {
  _id: string;
  title: string;
  description: string;
  quantity: string;
  buyerEmail: string;
  status: string;
  createdAt: string;
}

interface Offer {
  _id: string;
  requestId: string;
  supplierId: string;
  pricePerUnit: number;
  deliveryTime: string;
  status: string;
  createdAt: string;
}

interface AdminStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRequests: number;
    totalOffers: number;
    totalRevenue: number;
    verifiedSuppliers: number;
    pendingApprovals: number;
    activeProducts: number;
  };
  growth: {
    users: number;
    products: number;
    orders: number;
    requests: number;
    offers: number;
    revenue: number;
  };
  thisMonth: {
    users: number;
    products: number;
    orders: number;
    requests: number;
    offers: number;
    revenue: number;
  };
  orderStatus: {
    [key: string]: number;
  };
  recentActivity: Array<{
    type: string;
    id: string;
    title: string;
    subtitle: string;
    timestamp: string;
  }>;
  platformHealth: {
    activeProducts: number;
    totalProducts: number;
    verifiedSuppliers: number;
    totalUsers: number;
    conversionRate: number;
    avgOrderValue: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError("Failed to fetch statistics");
      }
    } catch (err) {
      setError("Error loading statistics");
      console.error("Error fetching admin stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch data based on active tab
  const fetchTabData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (tab === "users") {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (data.success) {
          setUsers(data.data.users || []);
        } else {
          setError("Failed to fetch users");
        }
      } else if (tab === "products") {
        const response = await fetch("/api/products?limit=50");
        const data = await response.json();
        if (data.success) {
          setProducts(data.data.products || []);
        } else {
          setError("Failed to fetch products");
        }
      } else if (tab === "requests") {
        const response = await fetch("/api/requests?limit=50");
        const data = await response.json();
        if (data.success) {
          setRequests(data.data.requests || []);
        } else {
          setError("Failed to fetch requests");
        }
      } else if (tab === "offers") {
        const response = await fetch("/api/offers?limit=50");
        const data = await response.json();
        if (data.success) {
          setOffers(data.data.offers || []);
        } else {
          setError("Failed to fetch offers");
        }
      }
    } catch (err) {
      setError("Error loading data");
      console.error("Error fetching tab data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchStats();
    }
  }, [session]);

  useEffect(() => {
    if (tab !== "overview" && session?.user?.role === 'admin') {
      fetchTabData();
    } else {
      setLoading(false);
    }
  }, [tab, session]);

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const response = await fetch(`/api/${type}/${id}`, { method: "DELETE" });
      
      if (response.ok) {
        // Update the appropriate state
        if (type === "users") {
          setUsers(users => users.filter(u => u._id !== id));
        } else if (type === "products") {
          setProducts(products => products.filter(p => p._id !== id));
        } else if (type === "requests") {
          setRequests(requests => requests.filter(r => r._id !== id));
        } else if (type === "offers") {
          setOffers(offers => offers.filter(o => o._id !== id));
        }
        
        // Refresh stats
        fetchStats();
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-purple-100 text-purple-800",
      open: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800"
    };
    
    return statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800";
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  const extendedSession = session as (typeof session & { user?: { role?: string } }) | null;
  if (extendedSession?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FiShield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    {
      label: "Total Users",
      value: stats.overview.totalUsers.toLocaleString(),
      change: formatGrowth(stats.growth.users),
      icon: <FiUsers className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      label: "Products Listed",
      value: stats.overview.totalProducts.toLocaleString(),
      change: formatGrowth(stats.growth.products),
      icon: <FiPackage className="w-8 h-8" />,
      color: "from-green-500 to-green-600"
    },
    {
      label: "Total Orders",
      value: stats.overview.totalOrders.toLocaleString(),
      change: formatGrowth(stats.growth.orders),
      icon: <FiFileText className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600"
    },
    {
      label: "Total Revenue",
      value: `PKR ${stats.overview.totalRevenue.toLocaleString()}`,
      change: formatGrowth(stats.growth.revenue),
      icon: <FiDollarSign className="w-8 h-8" />,
      color: "from-yellow-500 to-yellow-600"
    }
  ] : [];

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiBarChart className="w-5 h-5" /> },
    { id: "users", label: "Users", icon: <FiUsers className="w-5 h-5" />, count: users.length },
    { id: "products", label: "Products", icon: <FiPackage className="w-5 h-5" />, count: products.length },
    { id: "requests", label: "Requests", icon: <FiFileText className="w-5 h-5" />, count: requests.length },
    { id: "offers", label: "Offers", icon: <FiDollarSign className="w-5 h-5" />, count: offers.length }
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard - WholesaleHub</title>
        <meta name="description" content="Administrative dashboard for managing users, products, and platform operations." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your platform operations and monitor performance</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <FiDownload className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
                <button 
                  onClick={() => {
                    fetchStats();
                    if (tab !== "overview") {
                      fetchTabData();
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiRefreshCw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <FiAlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Stats Overview */}
          {tab === "overview" && (
            <div className="mb-8">
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
                      <div className="h-14 w-14 bg-gray-200 rounded-xl mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {statCards.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                          {stat.icon}
                        </div>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          stat.change.trend === 'up' ? 'bg-green-100 text-green-600' : 
                          stat.change.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {stat.change.trend === 'up' ? <FiTrendingUp className="w-3 h-3" /> : 
                           stat.change.trend === 'down' ? <FiTrendingDown className="w-3 h-3" /> : 
                           <FiActivity className="w-3 h-3" />}
                          <span>{stat.change.value}</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Platform Health & Recent Activity */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Platform Health */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Health</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Products</span>
                        <span className="font-semibold">{stats.platformHealth.activeProducts}/{stats.platformHealth.totalProducts}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Verified Suppliers</span>
                        <span className="font-semibold">{stats.platformHealth.verifiedSuppliers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Conversion Rate</span>
                        <span className="font-semibold">{stats.platformHealth.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg Order Value</span>
                        <span className="font-semibold">PKR {stats.platformHealth.avgOrderValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {stats.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                            activity.type === 'user' ? 'bg-blue-500' :
                            activity.type === 'order' ? 'bg-green-500' : 'bg-purple-500'
                          }`}>
                            {activity.type === 'user' ? <FiUsers className="w-4 h-4" /> :
                             activity.type === 'order' ? <FiPackage className="w-4 h-4" /> :
                             <FiFileText className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                            <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
                            <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  tab === tabItem.id
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tabItem.icon}
                <span>{tabItem.label}</span>
                {tabItem.count !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tab === tabItem.id ? "bg-white/20" : "bg-gray-200"
                  }`}>
                    {tabItem.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab !== "overview" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              {/* Search and Filters */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={`Search ${tab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiFilter className="w-4 h-4" />
                      <span>Filter</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <FiDownload className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading {tab}...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {tab === "users" && (
                            <>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </>
                          )}
                          {tab === "products" && (
                            <>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Supplier</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </>
                          )}
                          {tab === "requests" && (
                            <>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Buyer</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </>
                          )}
                          {tab === "offers" && (
                            <>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Request ID</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Delivery</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Users Tab */}
                        {tab === "users" && users.filter(user => 
                          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((user) => (
                          <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'supplier' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.verified ? 'active' : 'pending')}`}>
                                {user.verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-800 p-1">
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-800 p-1">
                                  <FiEdit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete("users", user._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* Products Tab */}
                        {tab === "products" && products.filter(product => 
                          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((product) => (
                          <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{product.title}</td>
                            <td className="py-3 px-4">{product.category}</td>
                            <td className="py-3 px-4">{product.supplier?.name || 'Unknown'}</td>
                            <td className="py-3 px-4">PKR {product.price.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-800 p-1">
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-800 p-1">
                                  <FiEdit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete("products", product._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* Requests Tab */}
                        {tab === "requests" && requests.filter(request => 
                          request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((request) => (
                          <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{request.title}</td>
                            <td className="py-3 px-4">{request.quantity}</td>
                            <td className="py-3 px-4">{request.buyerEmail}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{new Date(request.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-800 p-1">
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete("requests", request._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* Offers Tab */}
                        {tab === "offers" && offers.map((offer) => (
                          <tr key={offer._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-sm">{offer.requestId.slice(-8)}</td>
                            <td className="py-3 px-4">PKR {offer.pricePerUnit.toLocaleString()}</td>
                            <td className="py-3 px-4">{offer.deliveryTime}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(offer.status)}`}>
                                {offer.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{new Date(offer.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-800 p-1">
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete("offers", offer._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Empty State */}
                    {((tab === "users" && users.length === 0) ||
                      (tab === "products" && products.length === 0) ||
                      (tab === "requests" && requests.length === 0) ||
                      (tab === "offers" && offers.length === 0)) && !loading && (
                      <div className="text-center py-12">
                        <FiBarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No {tab} found</h3>
                        <p className="text-gray-600">No data available for this section.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
 