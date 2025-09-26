"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import {
  FiPackage,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiEye,
  FiTrash2
} from 'react-icons/fi';

interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
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
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: FiClock },
  confirmed: { bg: "bg-blue-100", text: "text-blue-800", icon: FiCheckCircle },
  processing: { bg: "bg-purple-100", text: "text-purple-800", icon: FiPackage },
  shipped: { bg: "bg-indigo-100", text: "text-indigo-800", icon: FiTruck },
  delivered: { bg: "bg-green-100", text: "text-green-800", icon: FiCheckCircle },
  cancelled: { bg: "bg-red-100", text: "text-red-800", icon: FiXCircle },
};

const paymentStatusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  paid: { bg: "bg-green-100", text: "text-green-800" },
  failed: { bg: "bg-red-100", text: "text-red-800" },
  refunded: { bg: "bg-gray-100", text: "text-gray-800" },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    paymentStatus: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    totalAmount: 0
  });

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signin?callbackUrl=/orders');
      return;
    }
  }, [session, status, router]);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.totalPages);
        
        // Calculate stats
        const newStats = {
          total: data.data.orders.length,
          pending: data.data.orders.filter((o: Order) => o.status === 'pending').length,
          processing: data.data.orders.filter((o: Order) => o.status === 'processing').length,
          shipped: data.data.orders.filter((o: Order) => o.status === 'shipped').length,
          delivered: data.data.orders.filter((o: Order) => o.status === 'delivered').length,
          totalAmount: data.data.orders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0)
        };
        setStats(newStats);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error loading orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session, currentPage, filters]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus as any } : order
        ));
        alert('Order status updated successfully');
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as any });
        }
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter(order => order._id !== orderId));
        alert('Order cancelled successfully');
        setShowOrderDetails(false);
      } else {
        alert('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order');
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusColors[status]?.icon || FiPackage;
    return IconComponent;
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

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMegaMenu={false} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {session.user?.role === 'supplier' ? 'Order Management' : 'My Orders'}
          </h1>
          <p className="text-gray-600">
            {session.user?.role === 'supplier' 
              ? 'Manage orders from your customers'
              : 'Track your order history and status'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiPackage className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.shipped}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FiTruck className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">PKR {stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Payment Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Date From */}
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Date To */}
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
            <span className="ml-2 text-red-600">{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {session.user?.role === 'supplier' 
                ? 'Orders from customers will appear here when they place orders'
                : 'Your order history will appear here when you make purchases'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {session.user?.role === 'supplier' ? 'Customer' : 'Supplier'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.products.length} item(s)
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {session.user?.role === 'supplier' ? order.buyerName : order.supplierName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {session.user?.role === 'supplier' ? order.buyerEmail : order.supplierEmail}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {order.products[0] && (
                                <img
                                  src={order.products[0].productImage || '/placeholder-product.jpg'}
                                  alt={order.products[0].productName}
                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.products[0]?.productName}{order.products[0] ? getVariationDisplay(order.products[0]) : ''}
                                </div>
                                {order.products.length > 1 && (
                                  <div className="text-sm text-gray-500">
                                    +{order.products.length - 1} more
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              PKR {order.totalAmount.toLocaleString()}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              paymentStatusColors[order.paymentStatus].bg
                            } ${paymentStatusColors[order.paymentStatus].text}`}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            {session.user?.role === 'supplier' ? (
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className={`text-xs px-2 py-1 rounded-full border-0 ${
                                  statusColors[order.status].bg
                                } ${statusColors[order.status].text}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            ) : (
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                statusColors[order.status].bg
                              } ${statusColors[order.status].text}`}>
                                <StatusIcon className="w-3 h-3" />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openOrderDetails(order)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              
                              {session.user?.role === 'buyer' && order.status === 'pending' && (
                                <button
                                  onClick={() => cancelOrder(order._id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Cancel Order"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Order Details</h2>
                    <p className="text-gray-600 mt-1">Order #{selectedOrder.orderNumber}</p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiXCircle className="w-6 h-6" />
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
                            <div className="font-medium">{selectedOrder.orderNumber}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Order Date:</span>
                            <div className="font-medium">
                              {new Date(selectedOrder.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[selectedOrder.status].bg
                            } ${statusColors[selectedOrder.status].text}`}>
                              {React.createElement(getStatusIcon(selectedOrder.status), { className: "w-3 h-3" })}
                              {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Payment:</span>
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              paymentStatusColors[selectedOrder.paymentStatus].bg
                            } ${paymentStatusColors[selectedOrder.paymentStatus].text}`}>
                              {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer/Supplier Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {session.user?.role === 'supplier' ? 'Customer' : 'Supplier'} Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4 text-gray-400" />
                            <span>{session.user?.role === 'supplier' ? selectedOrder.buyerName : selectedOrder.supplierName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMail className="w-4 h-4 text-gray-400" />
                            <span>{session.user?.role === 'supplier' ? selectedOrder.buyerEmail : selectedOrder.supplierEmail}</span>
                          </div>
                          {selectedOrder.buyerPhone && (
                            <div className="flex items-center gap-2">
                              <FiPhone className="w-4 h-4 text-gray-400" />
                              <span>{selectedOrder.buyerPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                        <div className="text-sm text-gray-700">
                          <div>{selectedOrder.shippingAddress.street}</div>
                          <div>
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                          </div>
                          <div>
                            {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
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
                        const groupedProducts = selectedOrder.products.reduce((acc, product, index) => {
                          const key = product.productId || product.productName;
                          if (!acc[key]) {
                            acc[key] = {
                              baseProduct: product,
                              variations: []
                            };
                          }
                          acc[key].variations.push({ ...product, originalIndex: index });
                          return acc;
                        }, {} as Record<string, { baseProduct: Order['products'][0]; variations: (Order['products'][0] & { originalIndex: number })[] }>);

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
                                        <div className="text-sm text-gray-600">PKR {variation.unitPrice.toLocaleString()} each</div>
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
                                        {variation.quantity} × PKR {variation.unitPrice.toLocaleString()}
                                      </div>
                                      <div className="text-lg font-bold text-blue-600">
                                        PKR {variation.totalPrice.toLocaleString()}
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
                                  PKR {group.variations.reduce((sum, v) => sum + v.totalPrice, 0).toLocaleString()}
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
                          <span className="font-medium text-gray-900">PKR {selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700 flex items-center gap-2">
                            <FiTruck className="w-4 h-4" />
                            Shipping Method:
                          </span>
                          <span className="font-medium text-gray-900">{selectedOrder.shippingMethod}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-700 flex items-center gap-2">
                            <FiCalendar className="w-4 h-4" />
                            Estimated Delivery:
                          </span>
                          <span className="font-medium text-gray-900">{selectedOrder.estimatedDelivery}</span>
                        </div>
                        <hr className="border-blue-200" />
                        <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4 border border-blue-300">
                          <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                          <span className="text-xl font-bold text-blue-600">PKR {selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedOrder.notes && (
                      <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
                  </div>
                  <div className="flex gap-4">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  
                  {session.user?.role === 'supplier' && selectedOrder.status !== 'cancelled' && (
                    <div className="flex gap-3">
                      {selectedOrder.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder._id, 'confirmed')}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Confirm Order
                        </button>
                      )}
                      {selectedOrder.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder._id, 'processing')}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Start Processing
                        </button>
                      )}
                      {selectedOrder.status === 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder._id, 'shipped')}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {selectedOrder.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 