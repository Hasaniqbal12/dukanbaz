"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { FiStar, FiSearch, FiShield, FiTruck, FiGlobe, FiArrowRight, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PageLayout from '@/components/PageLayout';

interface Product {
  id: number;
  title: string;
  img: string;
  price: string;
  originalPrice?: string;
  moq: string;
  supplier: string;
  rating: number;
  verified: boolean;
  discount?: number;
  ranking?: number;
  isNew?: boolean;
}

const features = [
  {
    icon: FiShield,
    title: "Trade Assurance",
    description: "Secure payments and quality guaranteed",
    color: "text-green-600"
  },
  {
    icon: FiTruck,
    title: "Fast Shipping",
    description: "Global logistics network",
    color: "text-blue-600"
  },
  {
    icon: FiGlobe,
    title: "Global Reach",
    description: "Connect with suppliers worldwide",
    color: "text-purple-600"
  },
  {
    icon: FiUsers,
    title: "Verified Suppliers",
    description: "Pre-screened quality partners",
    color: "text-orange-600"
  }
];

export default function Home() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [forYouProducts, setForYouProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=20&sort=createdAt&order=desc');
        const data = await response.json();
        
        if (data.success && data.products) {
          // Transform API data to match component interface
          interface ApiProduct {
            _id: string;
            title: string;
            images?: string[];
            price: number;
            originalPrice?: number;
            minimumOrderQuantity?: number;
            supplier?: { name?: string; verified?: boolean };
            rating?: number;
            discount?: number;
            createdAt: string;
          }
          
          const transformedProducts = data.products.map((product: ApiProduct) => ({
            id: product._id,
            title: product.title,
            img: product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
            price: `Rs ${product.price?.toLocaleString()}`,
            originalPrice: product.originalPrice ? `Rs ${product.originalPrice.toLocaleString()}` : undefined,
            moq: `${product.minimumOrderQuantity || 1} pcs`,
            supplier: product.supplier?.name || 'Verified Supplier',
            rating: product.rating || 4.0,
            verified: product.supplier?.verified || false,
            discount: product.discount,
            isNew: new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }));
          
          setNewProducts(transformedProducts.slice(0, 6));
          setForYouProducts(transformedProducts.slice(6, 12));
          setFeaturedProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback to sample data
        const sampleProducts = [
          {
            id: 1,
            title: "Smart Fitness Watch",
            img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
            price: "Rs 7,000",
            moq: "50 pcs",
            supplier: "Islamabad Tech Ltd.",
            rating: 4.5,
            verified: true,
            isNew: true,
          },
          {
            id: 2,
            title: "Eco-Friendly Yoga Mat",
            img: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
            price: "Rs 2,500",
            originalPrice: "Rs 3,600",
            moq: "50 pcs",
            supplier: "Lahore Fitness Pro Ltd.",
            rating: 4.7,
            verified: true,
            discount: 31,
            isNew: true,
          }
        ];
        setNewProducts(sampleProducts);
        setForYouProducts(sampleProducts);
        setFeaturedProducts(sampleProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      // Calculate scroll amount based on screen size
      const isMobile = window.innerWidth < 640;
      const scrollAmount = isMobile ? container.clientWidth * 0.7 : 320; // Scroll ~70% of container width on mobile
      const currentScroll = container.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`w-3 h-3 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden group hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <Image
          src={product.img}
          alt={product.title}
          width={400}
          height={280}
          className="w-full h-32 sm:h-48 lg:h-56 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.discount && (
          <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 bg-gradient-to-r from-red-500 to-pink-600 text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-xs font-bold shadow-lg">
            -{product.discount}%
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-xs font-bold shadow-lg">
            NEW
          </div>
        )}
        {product.verified && (
          <div className="absolute bottom-1.5 sm:bottom-3 right-1.5 sm:right-3 bg-white/90 backdrop-blur-sm text-indigo-600 p-1 sm:p-2 rounded-full shadow-lg">
            <FiShield className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 lg:p-6">
        <h3 className="font-semibold sm:font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base lg:text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">({product.rating})</span>
        </div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div>
            <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-gray-400 line-through ml-1 sm:ml-2">
                {product.originalPrice}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-500">MOQ: <span className="font-semibold text-gray-700">{product.moq}</span></span>
          <span className="text-indigo-600 font-semibold truncate max-w-[60px] sm:max-w-none">{product.supplier}</span>
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout 
        title="DukanBaz - Pakistan's Premier B2B Marketplace" 
        description="Connect with verified suppliers and buyers across Pakistan. Find quality products, negotiate bulk deals, and grow your business."
        showHeader={true}
        showFooter={true}
        showMegaMenu={true}
        backgroundPattern="gradient"
        containerMaxWidth="full"
      >
      {/* Modern Hero Section - Hidden on Mobile */}
      <section className="hidden md:block relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="relative px-4 sm:px-6 py-12 sm:py-16 lg:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                    Pakistan&apos;s Premier <span className="text-yellow-400">B2B Marketplace</span>
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-indigo-100 max-w-2xl">
                    Connect with verified suppliers and buyers across Pakistan. Source quality products, negotiate bulk deals, and grow your business with DukanBaz.
                  </p>
                </div>
                
                {/* Advanced Search Bar */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder="Search products, suppliers..."
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white rounded-lg sm:rounded-xl border-0 focus:ring-2 focus:ring-yellow-400 text-gray-900 placeholder-gray-500 text-sm sm:text-base lg:text-lg"
                      />
                    </div>
                    <button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                      Search Now
                    </button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-semibold sm:font-bold text-yellow-400">50K+</div>
                    <div className="text-xs sm:text-sm text-gray-300 font-normal">Suppliers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-semibold sm:font-bold text-yellow-400">2M+</div>
                    <div className="text-xs sm:text-sm text-gray-300 font-normal">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-semibold sm:font-bold text-yellow-400">100K+</div>
                    <div className="text-xs sm:text-sm text-gray-300 font-normal">Buyers</div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10">
                  <Image
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&crop=center"
                    alt="Business Partnership"
                    width={600}
                    height={400}
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* New Products */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold sm:font-bold text-gray-900 mb-1 sm:mb-2">✨ New Arrivals</h2>
                <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-normal">Latest products from verified suppliers</p>
              </div>
              <Link href="/products?filter=new" className="flex items-center gap-1 sm:gap-2 text-indigo-600 hover:text-indigo-700 font-medium sm:font-semibold text-sm sm:text-base lg:text-lg group">
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Horizontal Scroll Container */}
            <div className="relative group">
              {/* Left Arrow */}
              <button 
                onClick={() => scrollContainer('new-products-scroll', 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Right Arrow */}
              <button 
                onClick={() => scrollContainer('new-products-scroll', 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <FiChevronRight className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Scrollable Products Container */}
              <div 
                id="new-products-scroll"
                className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {newProducts.map((product) => (
                  <div key={product.id} className="flex-none w-[45%] min-w-[160px] sm:w-72 lg:w-80">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold sm:font-bold text-gray-900 mb-1 sm:mb-2">🎯 Recommended for You</h2>
                <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-normal">Curated products based on your interests</p>
              </div>
              <Link href="/products?filter=recommended" className="flex items-center gap-1 sm:gap-2 text-indigo-600 hover:text-indigo-700 font-medium sm:font-semibold text-sm sm:text-base lg:text-lg group">
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Horizontal Scroll Container */}
            <div className="relative group">
              {/* Left Arrow */}
              <button 
                onClick={() => scrollContainer('for-you-scroll', 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Right Arrow */}
              <button 
                onClick={() => scrollContainer('for-you-scroll', 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <FiChevronRight className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Scrollable Products Container */}
              <div 
                id="for-you-scroll"
                className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {forYouProducts.map((product) => (
                  <div key={product.id} className="flex-none w-[45%] min-w-[160px] sm:w-72 lg:w-80">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold sm:font-bold text-gray-900 mb-1 sm:mb-2">🏆 Featured Products</h2>
                <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-normal">Top-rated products from premium suppliers</p>
              </div>
              <Link href="/products?filter=featured" className="flex items-center gap-1 sm:gap-2 text-indigo-600 hover:text-indigo-700 font-medium sm:font-semibold text-sm sm:text-base lg:text-lg group">
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Grid Layout Container */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {featuredProducts.slice(0, 100).map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold sm:font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">Why Choose WholesaleHub?</h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-normal">Your trusted partner for B2B success</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold sm:font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold sm:font-bold mb-4 sm:mb-6">Ready to Grow Your Business?</h2>
            <p className="text-base sm:text-lg lg:text-2xl mb-6 sm:mb-8 lg:mb-10 text-indigo-100 font-normal">Join thousands of successful businesses on WholesaleHub</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/register?role=buyer" className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-base lg:text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Start as Buyer
              </Link>
              <Link href="/register?role=supplier" className="bg-yellow-400 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-base lg:text-lg hover:bg-yellow-300 transition-colors shadow-lg">
                Become a Supplier
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}