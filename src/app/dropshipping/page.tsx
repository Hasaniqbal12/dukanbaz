"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '../../components/PageLayout';
import {
  FiTruck,
  FiGlobe,
  FiShield,
  FiStar,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiFilter,
  FiGrid,
  FiList,
  FiSearch
} from 'react-icons/fi';

interface DropshipProduct {
  _id: string;
  title: string;
  images: string[];
  price: {
    wholesale: number;
    retail: number;
    profit: number;
  };
  category: string;
  supplier: {
    name: string;
    location: string;
    rating: number;
    verified: boolean;
    responseTime: string;
  };
  dropshipping: {
    available: boolean;
    fee: number;
    shippingTime: string;
    minOrder: number;
  };
  tags: string[];
  description: string;
  sold: number;
  trending: boolean;
}

interface DropshipSupplier {
  _id: string;
  name: string;
  logo: string;
  location: string;
  rating: number;
  verified: boolean;
  productsCount: number;
  categories: string[];
  responseTime: string;
  dropshippingFee: number;
  minOrder: number;
  description: string;
}

export default function DropshippingStorePage() {
  const [products, setProducts] = useState<DropshipProduct[]>([]);
  const [suppliers, setSuppliers] = useState<DropshipSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    location: '',
    verified: false,
    trending: false
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProducts: DropshipProduct[] = [
      {
        _id: '1',
        title: 'Wireless Bluetooth Earbuds - Premium Quality',
        images: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400'],
        price: {
          wholesale: 15,
          retail: 35,
          profit: 20
        },
        category: 'Electronics',
        supplier: {
          name: 'TechHub Electronics',
          location: 'Karachi, Pakistan',
          rating: 4.8,
          verified: true,
          responseTime: '< 2 hours'
        },
        dropshipping: {
          available: true,
          fee: 2,
          shippingTime: '3-5 days',
          minOrder: 1
        },
        tags: ['trending', 'fast-shipping', 'high-profit'],
        description: 'Premium wireless earbuds with noise cancellation',
        sold: 1250,
        trending: true
      },
      {
        _id: '2',
        title: 'Smart Fitness Watch - Health Tracker',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
        price: {
          wholesale: 25,
          retail: 60,
          profit: 35
        },
        category: 'Electronics',
        supplier: {
          name: 'Smart Devices Co',
          location: 'Lahore, Pakistan',
          rating: 4.6,
          verified: true,
          responseTime: '< 4 hours'
        },
        dropshipping: {
          available: true,
          fee: 3,
          shippingTime: '2-4 days',
          minOrder: 1
        },
        tags: ['health', 'fitness', 'smart'],
        description: 'Advanced fitness tracking with heart rate monitor',
        sold: 890,
        trending: false
      }
    ];

    const mockSuppliers: DropshipSupplier[] = [
      {
        _id: '1',
        name: 'TechHub Electronics',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
        location: 'Karachi, Pakistan',
        rating: 4.8,
        verified: true,
        productsCount: 245,
        categories: ['Electronics', 'Gadgets', 'Accessories'],
        responseTime: '< 2 hours',
        dropshippingFee: 2,
        minOrder: 1,
        description: 'Leading electronics supplier with 5+ years experience'
      },
      {
        _id: '2',
        name: 'Fashion Forward',
        logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100',
        location: 'Lahore, Pakistan',
        rating: 4.5,
        verified: true,
        productsCount: 180,
        categories: ['Fashion', 'Clothing', 'Accessories'],
        responseTime: '< 4 hours',
        dropshippingFee: 1.5,
        minOrder: 1,
        description: 'Trendy fashion items with fast shipping'
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 1000);
  }, []);

  const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

  return (
    <PageLayout
      title="Dropshipping Store - WholesaleHub"
      description="Find the best dropshipping products and suppliers in Pakistan. Start your dropshipping business with verified suppliers."
      showHeader={true}
      showFooter={true}
      showMegaMenu={true}
      backgroundPattern="gradient"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🚀 Dropshipping Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Start Your Dropshipping Business with Verified Pakistani Suppliers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-blue-100">Dropship Products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-blue-100">Verified Suppliers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-blue-100">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'products'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiPackage className="w-4 h-4 inline mr-2" />
                Dropship Products
              </button>
              <button
                onClick={() => setActiveTab('suppliers')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'suppliers'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiUsers className="w-4 h-4 inline mr-2" />
                Dropship Suppliers
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-purple-600 rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? <FiList className="w-5 h-5" /> : <FiGrid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home & Garden</option>
                </select>

                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Prices</option>
                  <option value="0-20">PKR 0 - 20</option>
                  <option value="20-50">PKR 20 - 50</option>
                  <option value="50+">PKR 50+</option>
                </select>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters({...filters, verified: e.target.checked})}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Verified Only</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.trending}
                    onChange={(e) => setFilters({...filters, trending: e.target.checked})}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Trending</span>
                </label>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <div
                    key={product._id}
                    className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        width={viewMode === 'list' ? 192 : 300}
                        height={viewMode === 'list' ? 192 : 300}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.trending && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <FiTrendingUp className="w-3 h-3" />
                            Trending
                          </span>
                        )}
                        {product.supplier.verified && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <FiShield className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Profit Badge */}
                      <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        +{formatPrice(product.price.profit)} Profit
                      </div>
                    </div>

                    <div className="p-4 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                        {product.title}
                      </h3>

                      {/* Pricing */}
                      <div className="mb-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Wholesale:</span>
                          <span className="font-semibold text-blue-600">{formatPrice(product.price.wholesale)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Retail:</span>
                          <span className="font-semibold text-green-600">{formatPrice(product.price.retail)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-1">
                          <span className="text-gray-600">Your Profit:</span>
                          <span className="font-bold text-purple-600">{formatPrice(product.price.profit)}</span>
                        </div>
                      </div>

                      {/* Supplier Info */}
                      <div className="mb-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <FiMapPin className="w-3 h-3" />
                          <span>{product.supplier.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{product.supplier.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            <span>{product.dropshipping.shippingTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Link
                          href={`/product/${product._id}`}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors text-center block"
                        >
                          View Product
                        </Link>
                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                          Add to Dropship List
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier._id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                          <Image
                            src={supplier.logo}
                            alt={supplier.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {supplier.name}
                            {supplier.verified && (
                              <FiShield className="w-4 h-4 text-green-500" />
                            )}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FiMapPin className="w-3 h-3" />
                            <span>{supplier.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{supplier.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Products:</span>
                          <span className="font-semibold">{supplier.productsCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="font-semibold">{supplier.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Response:</span>
                          <span className="font-semibold">{supplier.responseTime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dropship Fee:</span>
                          <span className="font-semibold text-purple-600">{formatPrice(supplier.dropshippingFee)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {supplier.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Link
                          href={`/supplier/${supplier._id}`}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors text-center block"
                        >
                          View Supplier
                        </Link>
                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                          Contact Supplier
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
