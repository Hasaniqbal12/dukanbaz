"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import PageLayout from "../../components/PageLayout";
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiStar, 
  FiShoppingCart,
  FiPackage,
  FiMapPin,
  FiShield,
  FiArrowLeft
} from "react-icons/fi";

interface Product {
  _id: string;
  title?: string;
  images?: string[];
  price?: number | {
    min?: number;
    max?: number;
    currency?: string;
  };
  supplierInfo?: {
    companyName?: string;
    location?: string;
    verified?: boolean;
  };
  category?: string;
  rating?: number;
  reviewCount?: number;
  minimumOrder?: {
    quantity?: number;
    unit?: string;
  };
  verified?: boolean;
  fastShipping?: boolean;
  discount?: number;
  tags?: string[];
  description?: string;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    supplier: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    verified: false,
    featured: false
  });

  // Fetch products from backend
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: currentQuery,
        ...filters,
        minPrice: filters.minPrice || '0',
        maxPrice: filters.maxPrice || '999999',
        verified: filters.verified.toString(),
        featured: filters.featured.toString()
      });

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      if (data.success) {
        console.log('API Response:', data); // Debug log
        const products = data.data?.products || [];
        setProducts(products);
        setCurrentPage(data.data?.pagination?.currentPage || 1);
        setTotalPages(data.data?.pagination?.totalPages || 1);
        setTotalProducts(data.data?.pagination?.totalProducts || 0);
      } else {
        // Handle API response without success flag
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount and when search/filters change
  useEffect(() => {
    fetchProducts(1);
  }, [currentQuery, filters]);

  // Update search query from URL params
  useEffect(() => {
    setCurrentQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(currentQuery)}`);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      supplier: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      verified: false,
      featured: false
    });
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          selectedOptions: {}
        }),
      });

      if (response.ok) {
        // Show success message or update cart state
        alert('Product added to cart!');
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const formatPrice = (product: Product) => {
    // Handle both simple price (number) and complex price object
    if (typeof product.price === 'number') {
      return `PKR ${product.price.toLocaleString()}`;
    }
    
    if (!product.price || typeof product.price !== 'object') {
      return 'PKR 0';
    }
    
    const minPrice = product.price.min || 0;
    const maxPrice = product.price.max || minPrice;
    
    if (minPrice === maxPrice) {
      return `PKR ${minPrice.toLocaleString()}`;
    }
    
    return `PKR ${minPrice.toLocaleString()} - PKR ${maxPrice.toLocaleString()}`;
  };

  return (
    <PageLayout
      title={currentQuery ? `Search: ${currentQuery} - WholesaleHub` : 'Search Products - WholesaleHub'}
      description={`Find products ${currentQuery ? `related to "${currentQuery}"` : ''} from verified suppliers across Pakistan`}
      showHeader={true}
      showFooter={true}
      showMegaMenu={true}
      backgroundPattern="gradient"
      containerMaxWidth="full"
    >
        {/* Search Header */}
        <div className="bg-white shadow-sm border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {viewMode === 'grid' ? <FiList className="w-5 h-5" /> : <FiGrid className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  placeholder="Search products, suppliers in Pakistan..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Results Header */}
          {!loading && (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {currentQuery ? `Search Results for "${currentQuery}"` : 'All Products'}
                </h1>
                <p className="text-gray-600">
                  Found {totalProducts.toLocaleString()} products from Pakistan suppliers
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-rating">Highest Rated</option>
                  <option value="title">Name A-Z</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => fetchProducts(currentPage)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className={`grid gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div 
                    className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'} cursor-pointer`}
                    onClick={() => router.push(`/product/${product._id}`)}
                  >
                    <Image
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center'}
                      alt={product.title || 'Product Image'}
                      width={viewMode === 'list' ? 192 : 300}
                      height={viewMode === 'list' ? 192 : 300}
                      className="w-full h-full object-cover"
                    />
                    
                    {product.supplierInfo?.verified && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <FiShield className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                    
                    {product.discount && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1">
                    <h3 
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {product.title || 'Product Name'}
                    </h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating || 0) 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">({product.rating || 0})</span>
                      <span className="text-xs text-gray-400">• {product.reviewCount || 0} reviews</span>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(product)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {product.minimumOrder?.quantity || 1} {product.minimumOrder?.unit || 'pcs'} (Min. Order)
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {product.supplierInfo?.companyName || 'Supplier'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiMapPin className="w-3 h-3" />
                        <span>{product.supplierInfo?.location || 'Pakistan'}</span>
                      </div>
                    </div>
                    
                    {/* Only Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {currentQuery 
                    ? `No products match your search for "${currentQuery}" in Pakistan`
                    : "No products available at the moment"
                  }
                </p>
                {currentQuery && (
                  <button
                    onClick={() => {
                      setCurrentQuery('');
                      router.push('/search');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search and browse all products
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => fetchProducts(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => fetchProducts(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => fetchProducts(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
    </PageLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}