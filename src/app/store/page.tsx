"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import PageLayout from '../../components/PageLayout';
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiTruck,
  FiShield,
  FiFilter,
  FiGrid,
  FiList,
  FiSearch,
  FiTag,
  FiMapPin,
  FiClock,
  FiPackage,
  FiZap,
  FiAward
} from 'react-icons/fi';

interface StoreProduct {
  _id: string;
  title: string;
  images: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount: number;
  description: string;
  features: string[];
  tags: string[];
  shipping: {
    free: boolean;
    time: string;
    cost?: number;
  };
  seller: {
    name: string;
    rating: number;
    location: string;
  };
  bestseller: boolean;
  newArrival: boolean;
}

export default function CustomerStorePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Toys', 'Automotive'
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProducts: StoreProduct[] = [
      {
        _id: '1',
        title: 'Premium Wireless Bluetooth Headphones - Noise Cancelling',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
        ],
        price: 2999,
        originalPrice: 4999,
        discount: 40,
        category: 'Electronics',
        brand: 'AudioTech',
        rating: 4.8,
        reviews: 1247,
        inStock: true,
        stockCount: 25,
        description: 'Experience premium sound quality with active noise cancellation technology.',
        features: ['Active Noise Cancellation', '30-hour Battery', 'Quick Charge', 'Wireless & Wired'],
        tags: ['bestseller', 'premium', 'wireless'],
        shipping: {
          free: true,
          time: '2-3 days'
        },
        seller: {
          name: 'TechHub Store',
          rating: 4.9,
          location: 'Karachi'
        },
        bestseller: true,
        newArrival: false
      },
      {
        _id: '2',
        title: 'Smart Fitness Watch with Heart Rate Monitor',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500'
        ],
        price: 1899,
        originalPrice: 2499,
        discount: 24,
        category: 'Electronics',
        brand: 'FitTech',
        rating: 4.6,
        reviews: 892,
        inStock: true,
        stockCount: 15,
        description: 'Track your fitness goals with advanced health monitoring features.',
        features: ['Heart Rate Monitor', 'Sleep Tracking', 'Waterproof', '7-day Battery'],
        tags: ['fitness', 'health', 'smart'],
        shipping: {
          free: true,
          time: '1-2 days'
        },
        seller: {
          name: 'Health & Fitness Co',
          rating: 4.7,
          location: 'Lahore'
        },
        bestseller: false,
        newArrival: true
      },
      {
        _id: '3',
        title: 'Organic Cotton T-Shirt - Premium Quality',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
        ],
        price: 899,
        originalPrice: 1299,
        discount: 31,
        category: 'Fashion',
        brand: 'EcoWear',
        rating: 4.4,
        reviews: 456,
        inStock: true,
        stockCount: 50,
        description: 'Comfortable and sustainable organic cotton t-shirt for everyday wear.',
        features: ['100% Organic Cotton', 'Pre-shrunk', 'Breathable', 'Machine Washable'],
        tags: ['organic', 'comfortable', 'sustainable'],
        shipping: {
          free: false,
          time: '3-5 days',
          cost: 150
        },
        seller: {
          name: 'Fashion Forward',
          rating: 4.5,
          location: 'Islamabad'
        },
        bestseller: false,
        newArrival: false
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddToCart = async (product: StoreProduct) => {
    try {
      await addToCart({
        id: product._id,
        name: product.title,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
      
      // Show success message (you can replace with a toast notification)
      alert(`${product.title} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout
      title="Online Store - WholesaleHub"
      description="Shop the best products from verified sellers across Pakistan. Fast delivery, secure payments, and quality guaranteed."
      showHeader={true}
      showFooter={true}
      showMegaMenu={true}
      backgroundPattern="gradient"
    >
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🛍️ Welcome to Our Store
            </h1>
            <p className="text-xl mb-6 text-blue-100">
              Discover amazing products from trusted sellers across Pakistan
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <FiTruck className="w-5 h-5" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <FiShield className="w-5 h-5" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <FiAward className="w-5 h-5" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
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
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? <FiList className="w-5 h-5" /> : <FiGrid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory ? `${selectedCategory} Products` : 'All Products'}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredProducts.length} items)
            </span>
          </h2>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-square'}`}>
                  <Link href={`/product/${product._id}`}>
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      width={viewMode === 'list' ? 256 : 300}
                      height={viewMode === 'list' ? 256 : 300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.discount && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{product.discount}%
                      </span>
                    )}
                    {product.bestseller && (
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <FiZap className="w-3 h-3" />
                        Bestseller
                      </span>
                    )}
                    {product.newArrival && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        New
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <FiHeart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                  </button>

                  {/* Quick View on Hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link
                      href={`/product/${product._id}`}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Quick View
                    </Link>
                  </div>
                </div>

                <div className="p-4 flex-1">
                  <div className="mb-2">
                    <span className="text-xs text-blue-600 font-medium">{product.brand}</span>
                  </div>

                  <Link href={`/product/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating) 
                              ? "text-yellow-400 fill-current" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="mb-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiTruck className="w-3 h-3" />
                      <span>
                        {product.shipping.free ? 'Free Shipping' : `Shipping: ${formatPrice(product.shipping.cost || 0)}`}
                      </span>
                      <span>• {product.shipping.time}</span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    {product.inStock ? (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ In Stock ({product.stockCount} left)
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">
                        ✗ Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    
                    <Link
                      href={`/product/${product._id}`}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
