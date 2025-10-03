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
          {/* Mobile Filter Button */}
          <div className="block lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg"
            >
              <FiFilter className="w-5 h-5" />
              <span>Filter</span>
              <span className="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {products.length}
              </span>
            </button>
          </div>

          {/* Mobile Filter Slide-out Panel */}
          {showFilters && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setShowFilters(false)}
              ></div>
              
              {/* Slide-out Panel */}
              <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                showFilters ? 'translate-x-0' : '-translate-x-full'
              } shadow-2xl`}>
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-600 text-white">
                  <div className="flex items-center gap-2">
                    <FiFilter className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Filter Products</h3>
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Panel Content */}
                <div className="p-4 h-full overflow-y-auto pb-20">
                  <div className="space-y-6">
                    {/* Results Count */}
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <p className="text-indigo-700 font-medium text-center">
                        {products.length} products found
                      </p>
                    </div>

                    {/* Mobile Search */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Search Products</label>
                      <form onSubmit={handleSearch}>
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={currentQuery}
                            onChange={(e) => setCurrentQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
                          />
                        </div>
                      </form>
                    </div>

                    {/* Mobile Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                      >
                        <option value="">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Home & Garden">Home & Garden</option>
                        <option value="Sports">Sports</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Health & Beauty">Health & Beauty</option>
                      </select>
                    </div>

                    {/* Mobile Price Range */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (PKR)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                        />
                      </div>
                    </div>

                    {/* Mobile Sort */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                      >
                        <option value="createdAt">Newest First</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="name">Name A-Z</option>
                      </select>
                    </div>

                    {/* Mobile Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.verified}
                            onChange={(e) => handleFilterChange('verified', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          Verified Suppliers Only
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.featured}
                            onChange={(e) => handleFilterChange('featured', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          Featured Products
                        </label>
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          clearFilters();
                          setShowFilters(false);
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main Layout with Sidebar */}
          <div className="flex gap-6">
            {/* Left Sidebar - Filters */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                  <FiFilter className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Filter Products</h3>
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-bold ml-auto">
                    {products.length}
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Search Products</label>
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={currentQuery}
                          onChange={(e) => setCurrentQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </form>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                    >
                      <option value="">All Categories</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Sports">Sports</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Health & Beauty">Health & Beauty</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range (PKR)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                    >
                      <option value="createdAt">Newest First</option>
                      <option value="price">Price: Low to High</option>
                      <option value="-price">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.verified}
                          onChange={(e) => handleFilterChange('verified', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Verified Suppliers Only
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.featured}
                          onChange={(e) => handleFilterChange('featured', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Featured Products
                      </label>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={clearFilters}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
              {/* Results Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6">
                <div className="text-sm text-gray-600">
                  Showing {products.length} products {currentQuery && `for "${currentQuery}"`}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Results</span>
                </div>
              </div>

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

              {/* Products Grid - Desktop 4 columns, Mobile List */}
              {!loading && !error && products.length > 0 && (
                <div className="mb-8">
                  {/* Desktop Grid View */}
                  <div className="hidden lg:grid lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white hover:bg-gray-50 transition-all duration-300 overflow-hidden cursor-pointer group"
                        onClick={() => router.push(`/product/${product._id}`)}
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <Image
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&crop=center'}
                            alt={product.title || 'Product Image'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Badges */}
                          {product.discount && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                              -{product.discount}%
                            </div>
                          )}
                          
                          {product.supplierInfo?.verified && (
                            <div className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full">
                              <FiShield className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-2 space-y-2">
                          {/* Title */}
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                            {product.title || 'Product Name'}
                          </h3>
                          
                          {/* Price */}
                          <div className="text-lg font-bold text-red-600">
                            {formatPrice(product)}
                          </div>
                          
                          {/* MOQ */}
                          <div className="text-xs text-gray-500">
                            MOQ: {product.minimumOrder?.quantity || 1} {product.minimumOrder?.unit || 'pcs'}
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1">
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
                            <span className="text-xs text-gray-500">({product.rating || 0})</span>
                          </div>
                          
                          {/* Supplier Info */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="truncate flex-1 mr-2">
                              {product.supplierInfo?.companyName || 'Supplier'}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <FiMapPin className="w-3 h-3" />
                              <span>{product.supplierInfo?.location || 'Pakistan'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile List View */}
                  <div className="lg:hidden space-y-1">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                        onClick={() => router.push(`/product/${product._id}`)}
                      >
                        <div className="flex p-2 gap-2">
                          {/* Product Image - Compact */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&crop=center'}
                              alt={product.title || 'Product Image'}
                              fill
                              className="object-cover"
                            />
                            
                            {/* Badges */}
                            {product.discount && (
                              <div className="absolute top-1 left-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                -{product.discount}%
                              </div>
                            )}
                            
                            {product.supplierInfo?.verified && (
                              <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full">
                                <FiShield className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          
                          {/* Product Info - Maximized */}
                          <div className="flex-1 min-w-0 space-y-1">
                            {/* Title */}
                            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
                              {product.title || 'Product Name'}
                            </h3>
                            
                            {/* Price */}
                            <div className="text-base font-bold text-red-600">
                              {formatPrice(product)}
                            </div>
                            
                            {/* MOQ */}
                            <div className="text-xs text-gray-500">
                              MOQ: {product.minimumOrder?.quantity || 1} {product.minimumOrder?.unit || 'pcs'}
                            </div>
                            
                            {/* Rating - Compact */}
                            <div className="flex items-center gap-1">
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
                              <span className="text-xs text-gray-500">({product.rating || 0})</span>
                            </div>
                            
                            {/* Supplier Info - Bottom */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="truncate flex-1 mr-2">
                                {product.supplierInfo?.companyName || 'Supplier'}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <FiMapPin className="w-3 h-3" />
                                <span>{product.supplierInfo?.location || 'Pakistan'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
          </div>
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