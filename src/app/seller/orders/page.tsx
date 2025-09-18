"use client";
import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  FiSearch,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiEye,
  FiDownload,
  FiX,
  FiShoppingCart,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiPrinter,
  FiLoader,
  FiAlertCircle,
  FiCalendar
} from "react-icons/fi";

interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  products: Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specifications?: string;
    // Variation fields
    variantId?: string;
    variantName?: string;
    color?: string;
    size?: string;
    material?: string;
    style?: string;
    variationAttributes?: Array<{
      name: string;
      value: string;
    }>;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: FiClock },
  confirmed: { bg: "bg-blue-100", text: "text-blue-800", icon: FiCheckCircle },
  processing: { bg: "bg-indigo-100", text: "text-indigo-800", icon: FiRefreshCw },
  shipped: { bg: "bg-purple-100", text: "text-purple-800", icon: FiTruck },
  delivered: { bg: "bg-green-100", text: "text-green-800", icon: FiPackage },
  cancelled: { bg: "bg-red-100", text: "text-red-800", icon: FiXCircle },
};

const statusOptions = ["All", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatusOptions = ["All", "pending", "paid", "failed", "refunded"];



export default function SupplierOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch orders using useCallback to avoid dependency issues
  const fetchOrders = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (paymentStatusFilter && paymentStatusFilter !== 'All') params.append('paymentStatus', paymentStatusFilter);
      
      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setFilteredOrders(data.data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, currentPage, itemsPerPage, sortBy, sortOrder, searchTerm, statusFilter, paymentStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      const updatedOrder = await response.json();
      
      // Update the orders list with the new status
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      );

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update order status');
      throw error;
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getStatusIcon = (status: string) => {
    const StatusIcon = statusColors[status]?.icon || FiClock;
    return <StatusIcon className="w-4 h-4" />;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };
  
  const getMainProduct = (products: Order['products']) => {
    return products[0] || {
      productName: 'No products',
      productImage: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0
    };
  };
  
  const getTotalQuantity = (products: Order['products']) => {
    return products.reduce((sum, product) => sum + product.quantity, 0);
  };

  const getVariationDisplay = (product: Order['products'][0]) => {
    const variations = [];
    
    if (product.color && product.color !== 'default') variations.push(product.color);
    if (product.size && product.size !== 'default') variations.push(product.size);
    if (product.material && product.material !== 'default') variations.push(product.material);
    if (product.style && product.style !== 'default') variations.push(product.style);
    
    // Use variationAttributes if available
    if (product.variationAttributes && product.variationAttributes.length > 0) {
      const attrs = product.variationAttributes.map(attr => attr.value).filter(val => val && val !== 'default');
      variations.push(...attrs);
    }
    
    return variations.length > 0 ? ` (${variations.join(', ')})` : '';
  };

  const getDetailedVariationDisplay = (product: Order['products'][0]) => {
    const variations = [];
    const addedLabels = new Set();
    
    // Add direct variation fields first
    if (product.color && product.color !== 'default') {
      variations.push({ label: 'Color', value: product.color });
      addedLabels.add('Color');
    }
    if (product.size && product.size !== 'default') {
      variations.push({ label: 'Size', value: product.size });
      addedLabels.add('Size');
    }
    if (product.material && product.material !== 'default') {
      variations.push({ label: 'Material', value: product.material });
      addedLabels.add('Material');
    }
    if (product.style && product.style !== 'default') {
      variations.push({ label: 'Style', value: product.style });
      addedLabels.add('Style');
    }
    
    // Add variationAttributes only if not already added
    if (product.variationAttributes && product.variationAttributes.length > 0) {
      product.variationAttributes.forEach(attr => {
        if (attr.value && attr.value !== 'default' && !addedLabels.has(attr.name)) {
          variations.push({ label: attr.name, value: attr.value });
          addedLabels.add(attr.name);
        }
      });
    }
    
    return variations;
  };
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your orders.</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <h2 className="text-xl font-semibold mb-2">Loading Orders...</h2>
          <p className="text-gray-600">Please wait while we fetch your orders.</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchOrders()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats from real orders data
  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(order => order.status === 'pending').length,
    shipped: filteredOrders.filter(order => order.status === 'shipped').length,
    revenue: filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  };

  return (
    <>
      <Head>
        <title>Orders – WholesaleHub</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          {/* Modern Header */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl opacity-10"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Order Management</h1>
                      <p className="text-gray-600 text-lg">Track, manage, and fulfill your customer orders with ease</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="group flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-indigo-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 hover:text-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                    <FiDownload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                    <span className="font-semibold">Export Orders</span>
                  </button>
                  <button className="group flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-purple-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                    <FiRefreshCw className="w-5 h-5 transition-transform group-hover:rotate-180" />
                    <span className="font-semibold">Refresh</span>
                  </button>
                  <button className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-indigo-500/25">
                    <FiPrinter className="w-5 h-5" />
                    <span className="font-semibold">Print Labels</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { title: "Total Orders", value: stats.total, icon: FiShoppingCart, gradient: "from-blue-500 to-cyan-500", change: "+12%", trend: "up" },
              { title: "Pending Orders", value: stats.pending, icon: FiClock, gradient: "from-amber-500 to-orange-500", change: "+3", trend: "up" },
              { title: "Shipped Orders", value: stats.shipped, icon: FiTruck, gradient: "from-purple-500 to-indigo-500", change: "+8", trend: "up" },
              { title: "Total Revenue", value: `PKR ${stats.revenue.toLocaleString()}`, icon: FiDollarSign, gradient: "from-emerald-500 to-green-500", change: "+15%", trend: "up" }
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`group relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in overflow-hidden`} 
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient} animate-pulse`}></div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        stat.trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">{stat.value}</p>
                  </div>
                </div>
                
                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:${stat.gradient} opacity-0 group-hover:opacity-20 transition-all duration-300`}></div>
              </div>
            ))}
          </div>

          {/* Modern Search and Filters */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-800/10 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative group">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search orders by ID, buyer, or product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-lg"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:bg-white transition-all duration-300 text-gray-900 shadow-sm focus:shadow-lg min-w-[140px]"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:bg-white transition-all duration-300 text-gray-900 shadow-sm focus:shadow-lg min-w-[160px]"
                >
                  {paymentStatusOptions.map(status => (
                    <option key={status} value={status}>{status === 'All' ? 'All Payment Status' : status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:bg-white transition-all duration-300 text-gray-900 shadow-sm focus:shadow-lg min-w-[120px]"
                >
                  <option value="createdAt">Date</option>
                  <option value="totalAmount">Total</option>
                  <option value="orderNumber">Order Number</option>
                  <option value="buyerName">Buyer</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="group flex items-center justify-center w-12 h-12 bg-white/70 border-2 border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  {sortOrder === 'asc' ? 
                    <FiChevronUp className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" /> : 
                    <FiChevronDown className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="card-glass p-6">
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const mainProduct = getMainProduct(order.products);
                const totalQuantity = getTotalQuantity(order.products);
                return (
                <div 
                  key={order._id} 
                  className="bg-white rounded-lg border-l-4 border-l-indigo-400 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* Order Header */}
                  <div className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={mainProduct.productImage || '/placeholder-product.jpg'} 
                          alt={mainProduct.productName} 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{mainProduct.productName}{getVariationDisplay(mainProduct)}</p>
                          <p className="text-sm text-gray-500">{order.buyerName}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-sm text-gray-500">{totalQuantity} units</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Details clicked for order:', order._id);
                              alert('Details button clicked!');
                              toggleExpandOrder(order._id);
                            }}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            style={{ pointerEvents: 'auto', zIndex: 10 }}
                          >
                            {expandedOrders.includes(order._id) ? '▲' : '▼'} Details
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('View clicked for order:', order);
                              alert('View button clicked!');
                              setModalOrder(order);
                            }}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            style={{ pointerEvents: 'auto', zIndex: 10 }}
                          >
                            👁 View
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Edit clicked for order:', order);
                              alert('Edit button clicked!');
                              setModalOrder(order);
                            }}
                            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            style={{ pointerEvents: 'auto', zIndex: 10 }}
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrders.includes(order._id) && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">Customer Info</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <FiUser className="w-4 h-4" />
                              {order.buyerName}
                            </div>
                            <div className="flex items-center gap-2">
                              <FiMail className="w-4 h-4" />
                              {order.buyerEmail}
                            </div>
                            <div className="flex items-center gap-2">
                              <FiPhone className="w-4 h-4" />
                              {order.buyerPhone || order.shippingAddress?.phone || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2">
                              <FiMapPin className="w-4 h-4" />
                              {`${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state}`}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">Order Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Order Date: {formatDate(order.createdAt)}</div>
                            <div>Est. Delivery: {order.estimatedDelivery || 'TBD'}</div>
                            <div>Unit Price: {formatCurrency(mainProduct.unitPrice)}</div>
                            <div>Payment: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span></div>
                            <div>Shipping: {order.shippingMethod}</div>
                            {order.trackingNumber && <div>Tracking: {order.trackingNumber}</div>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">Actions</h4>
                          <div className="space-y-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updating === order._id}
                              className="input-modern w-full"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {order.status === "pending" && (
                              <button
                                      onClick={() => handleStatusChange(order._id, "confirmed")}
                                      className="btn-primary btn-sm w-full"
                                      disabled={updating === order._id}
                                    >
                                      {updating === order._id ? 'Updating...' : 'Confirm Order'}
                                    </button>
                              )}
                              {order.status === "confirmed" && (
                                <button
                                  onClick={() => handleStatusChange(order._id, "processing")}
                                  className="btn-primary btn-sm w-full"
                                  disabled={updating === order._id}
                                >
                                  {updating === order._id ? 'Updating...' : 'Start Processing'}
                                </button>
                              )}
                              {order.status === "processing" && (
                                <button
                                  onClick={() => handleStatusChange(order._id, "shipped")}
                                  className="btn-primary btn-sm w-full"
                                  disabled={updating === order._id}
                                >
                                  {updating === order._id ? 'Updating...' : 'Mark as Shipped'}
                                </button>
                              )}
                              {order.status === "shipped" && (
                                <button
                                  onClick={() => handleStatusChange(order._id, "delivered")}
                                  className="btn-primary btn-sm w-full"
                                  disabled={updating === order._id}
                                >
                                  {updating === order._id ? 'Updating...' : 'Mark as Delivered'}
                                </button>
                              )}
                          </div>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-1">Notes</h4>
                          <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {filteredOrders.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {modalOrder && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={(e) => {
              // Close modal when clicking backdrop
              if (e.target === e.currentTarget) {
                setModalOrder(null);
              }
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Order Details</h2>
                    <p className="text-gray-600 mt-1">Order #{modalOrder.orderNumber}</p>
                  </div>
                  <button
                    onClick={() => setModalOrder(null)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Order Number:</span>
                            <div className="font-medium">{modalOrder.orderNumber}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Order Date:</span>
                            <div className="font-medium">
                              {formatDate(modalOrder.createdAt)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[modalOrder.status].bg} ${statusColors[modalOrder.status].text}`}>
                              {getStatusIcon(modalOrder.status)}
                              <span className="ml-1">{modalOrder.status}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Payment:</span>
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              modalOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              modalOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {modalOrder.paymentStatus}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4 text-gray-400" />
                            <span>{modalOrder.buyerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMail className="w-4 h-4 text-gray-400" />
                            <span>{modalOrder.buyerEmail}</span>
                          </div>
                          {modalOrder.buyerPhone && (
                            <div className="flex items-center gap-2">
                              <FiPhone className="w-4 h-4 text-gray-400" />
                              <span>{modalOrder.buyerPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                        <div className="text-sm text-gray-700">
                          <div>{modalOrder.shippingAddress.addressLine1}</div>
                          <div>
                            {modalOrder.shippingAddress.city}, {modalOrder.shippingAddress.state}
                          </div>
                          <div>
                            {modalOrder.shippingAddress.postalCode}, {modalOrder.shippingAddress.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products and Pricing */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
                    
                    <div className="space-y-6 mb-8">
                      {/* Group products by base product */}
                      {(() => {
                        // Group products by productId to show variations together
                        const groupedProducts = modalOrder.products.reduce((acc, product, index) => {
                          const key = product.productId || product.productName;
                          if (!acc[key]) {
                            acc[key] = {
                              baseProduct: product,
                              variations: []
                            };
                          }
                          acc[key].variations.push({ ...product, originalIndex: index });
                          return acc;
                        }, {} as Record<string, { baseProduct: any; variations: any[] }>);

                        return Object.entries(groupedProducts).map(([productKey, group], groupIndex) => (
                          <div key={productKey} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                            {/* Product Header */}
                            <div className="flex items-start gap-6 mb-6">
                              <div className="relative">
                                <img
                                  src={group.baseProduct.productImage || '/placeholder-product.jpg'}
                                  alt={group.baseProduct.productName}
                                  className="w-24 h-24 rounded-xl object-cover shadow-md"
                                />
                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                  #{groupIndex + 1}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-900 mb-2">{group.baseProduct.productName}</h4>
                                <div className="text-sm text-gray-600 mb-2">
                                  {group.variations.length} variation{group.variations.length > 1 ? 's' : ''} ordered
                                </div>
                                {group.baseProduct.specifications && (
                                  <div className="mb-3">
                                    <h5 className="text-sm font-medium text-gray-700 mb-1">Specifications:</h5>
                                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{group.baseProduct.specifications}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Variations List */}
                            <div className="space-y-4">
                              <h5 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">Order Variations:</h5>
                              {group.variations.map((variation, varIndex) => {
                                const variationDetails = getDetailedVariationDisplay(variation);
                                return (
                                  <div key={varIndex} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                          {varIndex + 1}
                                        </div>
                                        <div>
                                          {variation.variantName && (
                                            <div className="font-medium text-gray-900">{variation.variantName}</div>
                                          )}
                                          {variation.variantId && (
                                            <div className="text-xs text-gray-500">ID: {variation.variantId}</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">{variation.quantity} units</div>
                                        <div className="text-sm text-gray-600">{formatCurrency(variation.unitPrice)} each</div>
                                      </div>
                                    </div>

                                    {/* Variation Attributes */}
                                    {variationDetails.length > 0 && (
                                      <div className="mb-3">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                          {variationDetails.map((attr, attrIndex) => (
                                            <div key={attrIndex} className="bg-gray-50 rounded-lg p-3 text-center border">
                                              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                                                {attr.label}
                                              </div>
                                              <div className="text-sm font-semibold text-gray-900">
                                                {attr.value}
                                              </div>
                                              {/* Color preview for color attributes */}
                                              {attr.label.toLowerCase() === 'color' && (
                                                <div className="mt-2 mx-auto w-6 h-6 rounded-full border-2 border-gray-300" 
                                                     style={{ backgroundColor: attr.value.toLowerCase() }}>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Pricing Summary */}
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                      <div className="text-sm text-gray-600">
                                        {variation.quantity} × {formatCurrency(variation.unitPrice)}
                                      </div>
                                      <div className="text-lg font-bold text-blue-600">
                                        {formatCurrency(variation.totalPrice)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Product Total */}
                            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <div className="flex justify-between items-center">
                                <div className="text-sm font-medium text-blue-800">
                                  Total for {group.baseProduct.productName}:
                                </div>
                                <div className="text-xl font-bold text-blue-600">
                                  {formatCurrency(group.variations.reduce((sum, v) => sum + v.totalPrice, 0))}
                                </div>
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                {group.variations.reduce((sum, v) => sum + v.quantity, 0)} total units across {group.variations.length} variation{group.variations.length > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiDollarSign className="w-5 h-5 text-blue-600" />
                        Order Summary
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700">Subtotal:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(modalOrder.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700 flex items-center gap-2">
                            <FiTruck className="w-4 h-4" />
                            Shipping Method:
                          </span>
                          <span className="font-medium text-gray-900">{modalOrder.shippingMethod}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700 flex items-center gap-2">
                            <FiCalendar className="w-4 h-4" />
                            Estimated Delivery:
                          </span>
                          <span className="font-medium text-gray-900">{modalOrder.estimatedDelivery || 'TBD'}</span>
                        </div>
                        <hr className="border-blue-200" />
                        <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4 border border-blue-300">
                          <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                          <span className="text-xl font-bold text-blue-600">{formatCurrency(modalOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {modalOrder.notes && (
                      <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-700">{modalOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Last updated: {formatDate(modalOrder.updatedAt || modalOrder.createdAt)}
                  </div>
                  <div className="flex gap-4">
                    <select
                      value={modalOrder.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await handleStatusChange(modalOrder._id, newStatus);
                          // Update modal order with new status
                          setModalOrder({ ...modalOrder, status: newStatus as Order['status'] });
                          // Refresh orders list to show updated status
                          await fetchOrders();
                        } catch (error) {
                          console.error('Failed to update status:', error);
                          // Revert the select value on error
                          e.target.value = modalOrder.status;
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={updating === modalOrder._id}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button 
                      onClick={() => {
                        // Print functionality - could integrate with a print service
                        window.print();
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Print Invoice
                    </button>
                    <button 
                      onClick={() => {
                        // Close modal after status update
                        setModalOrder(null);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={updating === modalOrder._id}
                    >
                      {updating === modalOrder._id ? 'Updating...' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
