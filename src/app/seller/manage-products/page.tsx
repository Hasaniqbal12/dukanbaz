"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '../../../components/Header';
import Link from 'next/link';
import { 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiEye, 
  FiSearch,
  FiPackage,
  FiDollarSign,
  FiBarChart,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';

interface Product {
  _id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  originalPrice?: number;
  category: string;
  moq: string;
  available: number;
  unit: string;
  rating: number;
  totalReviews: number;
  status: 'active' | 'inactive' | 'draft' | 'outofstock';
  featured: boolean;
  trending: boolean;
  views: number;
  sold: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductStats {
  total: number;
  active: number;
  draft: number;
  outOfStock: number;
  totalViews: number;
  totalSold: number;
  totalRevenue: number;
}

export default function ManageProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    draft: 0,
    outOfStock: 0,
    totalViews: 0,
    totalSold: 0,
    totalRevenue: 0
  });

  const categories = [
    'Electronics', 'Apparel', 'Home & Garden', 'Sports & Outdoor',
    'Beauty & Personal Care', 'Automotive', 'Industrial Equipment',
    'Food & Beverages', 'Health & Medical', 'Office Supplies'
  ];

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signin?callbackUrl=/seller/manage-products');
      return;
    }
    
    if (session.user?.role !== 'supplier') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/products/supplier?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
        
        // Calculate stats
        const newStats: ProductStats = {
          total: data.data.products.length,
          active: data.data.products.filter((p: Product) => p.status === 'active').length,
          draft: data.data.products.filter((p: Product) => p.status === 'draft').length,
          outOfStock: data.data.products.filter((p: Product) => p.status === 'outofstock').length,
          totalViews: data.data.products.reduce((sum: number, p: Product) => sum + p.views, 0),
          totalSold: data.data.products.reduce((sum: number, p: Product) => sum + p.sold, 0),
          totalRevenue: data.data.products.reduce((sum: number, p: Product) => sum + (p.price * p.sold), 0)
        };
        setStats(newStats);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error loading products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'supplier') {
      fetchProducts();
    }
  }, [session, currentPage, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Delete product
  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        setShowDeleteModal(false);
        setProductToDelete(null);
        alert('Product deleted successfully');
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  // Toggle product status
  const toggleStatus = async (productId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setProducts(products.map(p => 
          p._id === productId ? { ...p, status: newStatus as Product['status'] } : p
        ));
        alert('Product status updated successfully');
      } else {
        alert('Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error updating product status');
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      alert('Please select products first');
      return;
    }

    try {
      const promises = selectedProducts.map(productId => {
        if (action === 'delete') {
          return fetch(`/api/products/${productId}`, { method: 'DELETE' });
        } else {
          return fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action }),
          });
        }
      });

      await Promise.all(promises);
      
      if (action === 'delete') {
        setProducts(products.filter(p => !selectedProducts.includes(p._id)));
      } else {
        setProducts(products.map(p => 
          selectedProducts.includes(p._id) ? { ...p, status: action as Product['status'] } : p
        ));
      }
      
      setSelectedProducts([]);
      alert(`Bulk ${action} completed successfully`);
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
      alert(`Error in bulk ${action}`);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!session || session.user?.role !== 'supplier') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMegaMenu={false} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Products</h1>
              <p className="text-gray-600">Manage your product catalog and inventory</p>
            </div>
            
            <Link
              href="/add-product"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Add Product
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">PKR {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FiBarChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Units Sold</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSold.toLocaleString()}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <FiTrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
              <option value="outofstock">Out of Stock</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Name A-Z</option>
              <option value="title-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="views-desc">Most Viewed</option>
              <option value="sold-desc">Best Selling</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('active')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('inactive')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <FiAlertCircle className="w-8 h-8 text-red-600" />
              <span className="ml-2 text-red-600">{error}</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Start by adding your first product to your catalog</p>
              <Link
                href="/add-product"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Add Product
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(products.map(p => p._id));
                            } else {
                              setSelectedProducts([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts([...selectedProducts, product._id]);
                              } else {
                                setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={product.images[0] || '/placeholder-product.jpg'}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                MOQ: {product.moq}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">PKR {product.price.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">per {product.unit}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className={`${
                            product.available === 0 ? 'text-red-600' : 
                            product.available < 100 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {product.available} {product.unit}s
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={product.status}
                            onChange={(e) => toggleStatus(product._id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full border-0 ${
                              product.status === 'active' ? 'bg-green-100 text-green-800' :
                              product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="inactive">Inactive</option>
                            <option value="outofstock">Out of Stock</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div className="text-xs text-gray-500">Views: {product.views}</div>
                            <div className="text-xs text-gray-500">Sold: {product.sold}</div>
                            <div className="text-xs text-gray-500">Rating: {product.rating}/5</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/product/${product._id}`}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Product"
                            >
                              <FiEye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/add-product?edit=${product._id}`}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Edit Product"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setProductToDelete(product._id);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete Product"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => productToDelete && handleDelete(productToDelete)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 