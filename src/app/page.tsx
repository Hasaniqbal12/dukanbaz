"use client";

import Image from "next/image";
import Link from "next/link";
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

const newProducts: Product[] = [
  {
    id: 11,
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
    id: 12,
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
];

const forYouProducts: Product[] = [
  {
    id: 6,
    title: "Ceramic Flower Vase",
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    price: "PKR 1,700 - PKR 3,000",
    moq: "50 pcs",
    supplier: "Multan Ceramics",
    rating: 4.6,
    verified: true,
  },
  {
    id: 7,
    title: "Stainless Steel Kitchen Set",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    price: "PKR 8,500 - PKR 12,000",
    moq: "25 pcs",
    supplier: "Gujranwala Steel Works",
    rating: 4.7,
    verified: true,
  },
];

const featuredProducts: Product[] = [
  {
    id: 21,
    title: "Solar LED Street Light",
    img: "https://images.unsplash.com/photo-1564094467889-f4f7e3a00270?w=400&h=400&fit=crop",
    price: "Rs 15,000",
    moq: "5 pcs",
    supplier: "Renewable Energy Solutions",
    rating: 4.8,
    verified: true,
  },
  // Generate 99 more products programmatically
  ...Array.from({ length: 99 }, (_, index) => {
    const productId = 22 + index;
    const productTypes = [
      { type: "Electronics", img: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop" },
      { type: "Machinery", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop" },
      { type: "Textiles", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
      { type: "Hardware", img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop" },
      { type: "Chemicals", img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=400&fit=crop" },
      { type: "Food Products", img: "https://images.unsplash.com/photo-1506617420156-8e4536971650?w=400&h=400&fit=crop" },
      { type: "Medical Equipment", img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop" },
      { type: "Construction", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop" },
      { type: "Automotive", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop" },
      { type: "Packaging", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop" },
    ];
    
    const suppliers = [
      "Global Tech Solutions", "Premium Manufacturing Co", "Quality Exports Ltd", 
      "Industrial Partners", "Elite Suppliers", "Trusted Wholesale Hub", 
      "Professional Trading Co", "Advanced Industries", "Reliable Exports", 
      "Top Grade Manufacturing", "Excellence Trading", "Prime Industrial Co",
      "Superior Products Ltd", "Quality First Trading", "Professional Exports",
      "Advanced Manufacturing", "Elite Industrial Co", "Premium Trading Hub",
      "Global Quality Solutions", "Industrial Excellence Ltd"
    ];

    const productType = productTypes[index % productTypes.length];
    const supplier = suppliers[index % suppliers.length];
    const basePrice = 1000 + (index * 50);
    const rating = 4.0 + (Math.random() * 1.0);
    const moqOptions = ["10 pcs", "25 pcs", "50 pcs", "100 pcs", "500 pcs", "1000 pcs"];
    
    return {
      id: productId,
      title: `${productType.type} Product ${productId}`,
      img: productType.img,
      price: `Rs ${basePrice.toLocaleString()}`,
      moq: moqOptions[index % moqOptions.length],
      supplier: supplier,
      rating: Math.round(rating * 10) / 10,
      verified: index % 3 === 0,
      isNew: index % 5 === 0,
      discount: index % 4 === 0 ? Math.floor(Math.random() * 30) + 10 : undefined,
      originalPrice: index % 4 === 0 ? `Rs ${Math.floor(basePrice * 1.3).toLocaleString()}` : undefined,
    };
  })
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
      title="WholesaleHub - Pakistan's Premier B2B Marketplace" 
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
                  <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold sm:font-bold leading-tight">
                    Find Your Next
                    <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      Business Partner
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg lg:text-2xl text-gray-200 leading-relaxed font-normal">
                    Connect with verified suppliers and buyers across Pakistan. Quality products, competitive prices, secure transactions.
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
              <Link href="/signup?role=buyer" className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-base lg:text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Start as Buyer
              </Link>
              <Link href="/signup?role=supplier" className="bg-yellow-400 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-base lg:text-lg hover:bg-yellow-300 transition-colors shadow-lg">
                Become a Supplier
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}