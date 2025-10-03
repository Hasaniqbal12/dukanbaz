"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';
import {  FiSearch, FiShield, FiTruck, FiGlobe, FiArrowRight, FiUsers, FiChevronLeft, FiChevronRight, FiEdit3 } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import PageLayout from '../components/PageLayout';

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

const categories = [
  { name: "Electronics", icon: "📱", color: "from-blue-500 to-indigo-600" },
  { name: "Apparel", icon: "👕", color: "from-pink-500 to-rose-600" },
  { name: "Home & Garden", icon: "🏠", color: "from-green-500 to-emerald-600" },
  { name: "Machinery", icon: "⚙️", color: "from-gray-500 to-slate-600" },
  { name: "Beauty & Personal Care", icon: "💄", color: "from-purple-500 to-violet-600" },
  { name: "Sports & Outdoor", icon: "⚽", color: "from-orange-500 to-amber-600" },
  { name: "Automotive", icon: "🚗", color: "from-red-500 to-rose-600" },
  { name: "Industrial Equipment", icon: "🏭", color: "from-yellow-500 to-orange-600" },
  { name: "Food & Beverages", icon: "🍕", color: "from-green-500 to-lime-600" },
  { name: "Health & Medical", icon: "⚕️", color: "from-teal-500 to-cyan-600" }
];

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
  const { data: session } = useSession();
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [forYouProducts, setForYouProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('🔄 Fetching products from API...');
        
        // Fetch different types of products in parallel
        const [recentResponse, recommendedResponse, featuredRandomResponse, randomResponse] = await Promise.all([
          fetch('/api/products/featured?type=recent&limit=6'),
          fetch('/api/products/featured?type=recommended&limit=6'),
          fetch('/api/products/random?limit=6'), // Random products for featured section
          fetch('/api/products/random?limit=6')   // Random products for discovery section
        ]);

        console.log('📡 API Response Status:', {
          recent: recentResponse.status,
          recommended: recommendedResponse.status,
          featuredRandom: featuredRandomResponse.status,
          random: randomResponse.status
        });

        const [recentData, recommendedData, featuredRandomData, randomData] = await Promise.all([
          recentResponse.json(),
          recommendedResponse.json(),
          featuredRandomResponse.json(),
          randomResponse.json()
        ]);

        console.log('📊 API Data:', {
          recent: { success: recentData.success, count: recentData.products?.length || 0 },
          recommended: { success: recommendedData.success, count: recommendedData.products?.length || 0 },
          featuredRandom: { success: featuredRandomData.success, count: featuredRandomData.products?.length || 0 },
          random: { success: randomData.success, count: randomData.products?.length || 0 }
        });

        // Transform API data to match component interface
        interface ApiProduct {
          _id: string;
          title: string;
          name: string;
          images?: string[];
          price: number;
          originalPrice?: number;
          comparePrice?: number;
          minimumOrderQuantity?: number;
          moq?: number;
          supplier?: { 
            name?: string; 
            companyName?: string;
            verified?: boolean; 
          };
          rating?: number;
          discount?: number;
          createdAt: string;
          views?: number;
        }

        const transformProduct = (product: ApiProduct) => ({
          id: product._id,
          title: product.title || product.name,
          img: product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
          price: `Rs ${product.price?.toLocaleString()}`,
          originalPrice: (product.originalPrice || product.comparePrice) ? 
            `Rs ${(product.originalPrice || product.comparePrice)?.toLocaleString()}` : undefined,
          moq: `${product.minimumOrderQuantity || product.moq || 1} pcs`,
          supplier: product.supplier?.companyName || product.supplier?.name || 'Verified Supplier',
          rating: product.rating || 4.0,
          verified: product.supplier?.verified || false,
          discount: product.discount,
          isNew: new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        });
        
        // Set products from API responses
        if (recentData.success && recentData.products) {
          const transformedRecent = recentData.products.map(transformProduct);
          console.log('✨ Setting new products:', transformedRecent.length);
          setNewProducts(transformedRecent);
        }
        
        if (recommendedData.success && recommendedData.products) {
          const transformedRecommended = recommendedData.products.map(transformProduct);
          console.log('🎯 Setting recommended products:', transformedRecommended.length);
          setForYouProducts(transformedRecommended);
        }
        
        if (featuredRandomData.success && featuredRandomData.products) {
          const transformedFeatured = featuredRandomData.products.map(transformProduct);
          console.log('🏆 Setting featured products:', transformedFeatured.length);
          setFeaturedProducts(transformedFeatured);
        }
        
        if (randomData.success && randomData.products) {
          const transformedRandom = randomData.products.map(transformProduct);
          console.log('🎲 Setting random products:', transformedRandom.length);
          setRandomProducts(transformedRandom);
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
          },
          {
            id: 3,
            title: "Wireless Bluetooth Headphones",
            img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
            price: "Rs 4,500",
            originalPrice: "Rs 6,000",
            moq: "25 pcs",
            supplier: "Karachi Electronics Co.",
            rating: 4.3,
            verified: true,
            discount: 25,
            isNew: false,
          },
          {
            id: 4,
            title: "Premium Cotton T-Shirt",
            img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
            price: "Rs 1,200",
            moq: "100 pcs",
            supplier: "Faisalabad Textiles",
            rating: 4.6,
            verified: true,
            isNew: true,
          }
        ];
        
        setNewProducts(sampleProducts);
        setForYouProducts(sampleProducts);
        setFeaturedProducts(sampleProducts);
        setRandomProducts(sampleProducts);
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


  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-white hover:bg-gray-50 overflow-hidden transition-all duration-200 group cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.img}
            alt={product.title}
            width={280}
            height={280}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          {product.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </div>
          )}
          
          {product.isNew && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </div>
          )}
          
          {product.verified && (
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full">
              <FiShield className="w-3 h-3" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-1 space-y-1">
          {/* Title */}
          <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight min-h-[2rem] group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          
          {/* Price */}
          <div className="text-base font-bold text-red-600">
            {product.price}
          </div>
          
          {/* MOQ */}
          <div className="text-xs text-gray-500">
            MOQ: <span className="font-medium text-gray-700">{product.moq}</span>
          </div>
        </div>
      </div>
    </Link>
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
                    <button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-base lg:text-lg hover:scale-105 shadow-lg">
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

      {/* Categories Section - Mobile Only */}
      <section className="md:hidden py-4 sm:py-6 bg-white border-b border-gray-100">
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Browse Categories</h2>
              <Link href="/search" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All
              </Link>
            </div>
            
            {/* Horizontal Scrollable Categories */}
            <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={`/search?category=${encodeURIComponent(category.name)}`}
                  className="flex-none group"
                >
                  <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-lg sm:text-2xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {category.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Post Request Button - Mobile Only */}
      <section className="md:hidden py-3 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="px-4">
          <div className="max-w-sm mx-auto">
            <Link href="/requests" className="block">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FiEdit3 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Post a Request</h3>
                    <p className="text-indigo-100 text-sm">Get quotes from verified suppliers</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 opacity-70" />
                </div>
              </div>
            </Link>
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
                className="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {newProducts.map((product) => (
                  <div key={product.id} className="flex-none w-[32%] min-w-[160px] sm:w-[200px] lg:w-[220px]">
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
                className="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {forYouProducts.map((product) => (
                  <div key={product.id} className="flex-none w-[32%] min-w-[160px] sm:w-[200px] lg:w-[220px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Random Products */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold sm:font-bold text-gray-900 mb-1 sm:mb-2">🎲 Discover Something New</h2>
                <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-normal">Random products from our marketplace</p>
              </div>
              <Link href="/products?filter=random" className="flex items-center gap-1 sm:gap-2 text-indigo-600 hover:text-indigo-700 font-medium sm:font-semibold text-sm sm:text-base lg:text-lg group">
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Horizontal Scroll Container */}
            <div className="relative group">
              {/* Left Arrow */}
              <button 
                onClick={() => scrollContainer('random-products-scroll', 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <FiChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Right Arrow */}
              <button 
                onClick={() => scrollContainer('random-products-scroll', 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              >
                <FiChevronRight className="w-6 h-6 text-gray-700" />
              </button>
              
              {/* Scrollable Products Container */}
              <div 
                id="random-products-scroll"
                className="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {randomProducts.map((product) => (
                  <div key={product.id} className="flex-none w-[32%] min-w-[160px] sm:w-[200px] lg:w-[220px]">
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
                <p className="text-sm sm:text-base lg:text-xl text-gray-600 font-normal">Random selection from our marketplace</p>
              </div>
              <Link href="/products?filter=featured" className="flex items-center gap-1 sm:gap-2 text-indigo-600 hover:text-indigo-700 font-medium sm:font-semibold text-sm sm:text-base lg:text-lg group">
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Products Grid - Responsive */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-1">
              {featuredProducts.slice(0, 6).map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-4 sm:py-12 lg:py-16 bg-white">
        <div className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-4 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-semibold sm:font-bold text-gray-900 mb-1 sm:mb-3 lg:mb-4">Why Choose DukanBaz?</h2>
              <p className="text-xs sm:text-base lg:text-xl text-gray-600 font-normal">Your trusted partner for B2B success</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className={`w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-6 h-6 sm:w-10 sm:h-10" />
                    </div>
                    <h3 className="text-sm sm:text-xl font-medium sm:font-bold text-gray-900 mb-1 sm:mb-3">{feature.title}</h3>
                    <p className="text-xs sm:text-base text-gray-600 leading-tight sm:leading-relaxed font-normal">{feature.description}</p>
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