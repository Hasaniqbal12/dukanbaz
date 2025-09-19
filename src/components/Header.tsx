"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import CartHoverDropdown from '../components/cart/CartHoverDropdown';
import MessagesHoverDropdown from '../components/header/MessagesHoverDropdown';
import OrdersHoverDropdown from '../components/header/OrdersHoverDropdown';
import ProfileHoverDropdown from '../components/header/ProfileHoverDropdown';
import MegaMenuDropdown from '../components/header/MegaMenuDropdown';
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiBook,
  FiChevronDown,
  FiPackage,
  FiTruck,
  FiShield,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiHeart,
  FiMessageCircle,
  FiSettings,
  FiLogOut,
  FiBell,
  FiMessageSquare,
  FiGrid,
  FiTrendingUp,
  FiAward,
  FiUsers,
  FiClipboard,
  FiDollarSign,
  FiTarget,
  FiGlobe,
  FiZap,
} from 'react-icons/fi';

interface HeaderProps {
  showMegaMenu?: boolean;
  className?: string;
}

// Categories data for mega menu
const categories = [
  {
    name: "Electronics",
    icon: FiPackage,
    color: "from-blue-500 to-purple-600",
    subcategories: ["Smartphones", "Laptops", "Tablets", "Headphones", "Cameras", "Smart Watches"]
  },
  {
    name: "Fashion",
    icon: FiHeart,
    color: "from-pink-500 to-rose-600",
    subcategories: ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories", "Bags", "Jewelry"]
  },
  {
    name: "Home & Garden",
    icon: FiTruck,
    color: "from-green-500 to-emerald-600",
    subcategories: ["Furniture", "Kitchen", "Bathroom", "Garden", "Decor", "Storage"]
  },
  {
    name: "Sports",
    icon: FiShield,
    color: "from-orange-500 to-red-600",
    subcategories: ["Fitness", "Outdoor", "Team Sports", "Water Sports", "Winter Sports", "Cycling"]
  },
  {
    name: "Automotive",
    icon: FiTruck,
    color: "from-gray-500 to-slate-600",
    subcategories: ["Car Parts", "Motorcycles", "Tools", "Accessories", "Tires", "Electronics"]
  },
  {
    name: "Industrial",
    icon: FiSettings,
    color: "from-indigo-500 to-blue-600",
    subcategories: ["Machinery", "Tools", "Safety", "Materials", "Components", "Equipment"]
  },
  {
    name: "Health & Beauty",
    icon: FiHeart,
    color: "from-purple-500 to-pink-600",
    subcategories: ["Skincare", "Makeup", "Hair Care", "Health", "Supplements", "Medical"]
  },
  {
    name: "Books & Education",
    icon: FiBook,
    color: "from-yellow-500 to-orange-600",
    subcategories: ["Textbooks", "Fiction", "Non-Fiction", "Children's Books", "Educational", "Reference"]
  }
];

interface DashboardData {
  cart?: {
    summary?: {
      totalItems: number;
      totalAmount: number;
    };
    items?: Array<{
      id: string;
      productName: string;
      productImage?: string;
      quantity: number;
      price: number;
    }>;
  };
  messages?: {
    unreadCount: number;
    recent?: Array<{
      _id: string;
      senderId: string;
      senderName: string;
      content: string;
      createdAt: string;
      isRead: boolean;
    }>;
  };
  orders?: {
    pendingCount: number;
    recent?: Array<{
      _id: string;
      orderNumber: string;
      status: string;
      createdAt: string;
      items?: Array<{
        productName: string;
      }>;
    }>;
  };
}

export default function Header({ className = "" }: HeaderProps) {
  const { data: session } = useSession();
  const { items: cartItems } = useCart();
  const router = useRouter();
  const [ordersHover, setOrdersHover] = useState(false);
  const [profileHover, setProfileHover] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [messagesHover, setMessagesHover] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Load dashboard data on component mount if user is logged in
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (dashboardLoading || !session?.user) return;
      
      try {
        setDashboardLoading(true);
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard data received:', data); // Debug log
          setDashboardData(data.data || {});
        } else {
          console.error('Dashboard API error:', response.status, response.statusText);
          // Set mock data for testing if API fails
          setDashboardData({
            orders: {
              pendingCount: 3,
              recent: [
                {
                  _id: '1',
                  orderNumber: 'WH-001234',
                  status: 'Pending',
                  createdAt: new Date().toISOString(),
                  items: [{ productName: 'Sample Product 1' }]
                },
                {
                  _id: '2',
                  orderNumber: 'WH-001235',
                  status: 'Confirmed',
                  createdAt: new Date(Date.now() - 86400000).toISOString(),
                  items: [{ productName: 'Sample Product 2' }]
                }
              ]
            },
            messages: {
              unreadCount: 2,
              recent: []
            }
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    if (session?.user && Object.keys(dashboardData).length === 0) {
      fetchDashboardData();
    }
  }, [session?.user, dashboardData, dashboardLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results.products || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    if (query.length > 2) {
      setTimeout(() => handleSearch(query), 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleMobileSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && mobileSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery("");
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${className}`}>
      {/* Main Header - Desktop Only */}
      <div className="hidden md:block bg-white/95 backdrop-blur-lg border-b border-gray-50/30 shadow-lg">
        <div className="max-w-full mx-auto px-6">
          {/* First Row - Logo, Search, Actions */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                  DukanBaz
                </span>
                <span className="text-xs text-blue-100 block">Pakistan B2B Marketplace</span>
              </div>
            </Link>

            {/* Advanced Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search for products, suppliers, or categories..."
                  className="w-full pl-12 pr-20 py-3 bg-gray-50 border border-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300"
                  onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">Search Results</h3>
                      {searchResults.slice(0, 8).map((product: any, index) => (
                        <Link
                          key={index}
                          href={`/product/${product._id || product.id}`}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                            {product.images?.[0] && (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{product.category}</p>
                            <p className="text-sm font-semibold text-indigo-600">${product.price}</p>
                          </div>
                        </Link>
                      ))}
                      {searchResults.length > 8 && (
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          className="block text-center py-3 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                          onClick={() => setShowSearchResults(false)}
                        >
                          View all {searchResults.length} results
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* User Action Icons */}
              <div className="flex items-center space-x-2">
                {/* Cart Icon */}
                <div 
                  className="relative"
                  onMouseEnter={() => setCartHover(true)}
                  onMouseLeave={() => setCartHover(false)}
                >
                  <Link 
                    href="/cart" 
                    className="relative p-2 text-gray-600 hover:text-indigo-600 rounded-lg transition-all duration-300"
                    title="Shopping Cart"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    {cartItems && Array.isArray(cartItems) && cartItems.length > 0 && (
                      <span className="absolute -top-4 -left-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                  
                  {/* Cart Hover Dropdown */}
                  <CartHoverDropdown 
                    isVisible={cartHover} 
                    onClose={() => setCartHover(false)} 
                  />
                </div>

                {/* Messages Icon */}
                <div 
                  className="relative"
                  onMouseEnter={() => setMessagesHover(true)}
                  onMouseLeave={() => setMessagesHover(false)}
                >
                  <Link 
                    href="/messages" 
                    className="relative p-2 text-gray-600 hover:text-indigo-600 rounded-lg transition-all duration-300"
                    title="Messages"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                    {(dashboardData?.messages?.unreadCount || 0) > 0 && (
                      <span className="absolute -top-4 -left-2 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                        {dashboardData?.messages?.unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* Messages Hover Popover */}
                  <MessagesHoverDropdown 
                    isVisible={messagesHover}
                    messages={dashboardData?.messages}
                  />
                </div>

                {/* Orders Icon */}
                <div 
                  className="relative"
                  onMouseEnter={() => setOrdersHover(true)}
                  onMouseLeave={() => setOrdersHover(false)}
                >
                  <Link 
                    href="/orders" 
                    className="relative p-2 text-gray-600 hover:text-indigo-600 rounded-lg transition-all duration-300"
                    title="Orders"
                  >
                    <FiClipboard className="w-5 h-5" />
                    {(dashboardData?.orders?.pendingCount || 0) > 0 && (
                      <span className="absolute -top-4 -left-2 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                        {dashboardData?.orders?.pendingCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* Orders Hover Popover */}
                  <OrdersHoverDropdown 
                    isVisible={ordersHover}
                    orders={dashboardData?.orders}
                  />
                </div>

                {/* Profile Icon */}
                <div 
                  className="relative"
                  onMouseEnter={() => setProfileHover(true)}
                  onMouseLeave={() => setProfileHover(false)}
                >
                  <Link 
                    href="/profile" 
                    className="relative p-2 text-gray-600 hover:text-indigo-600 rounded-lg transition-all duration-300"
                    title="Profile"
                  >
                    <FiUser className="w-5 h-5" />
                  </Link>
                  
                  {/* Profile Hover Popover */}
                  <ProfileHoverDropdown 
                    isVisible={profileHover}
                    user={session?.user as { name?: string; email?: string; image?: string } | undefined}
                  />
                </div>
              </div>

              {/* Authentication Buttons */}
              <div className="flex items-center space-x-3">
                {session ? (
                  <Link 
                    href={session.user?.email?.includes('supplier') ? '/supplier-dashboard' : '/supplier-dashboard'}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/signin" 
                      className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      Join Now
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Second Row - Navigation */}
          <div className="hidden lg:flex items-center justify-start h-12 border-t border-gray-100 pl-8">
            <nav className="flex items-center space-x-8">
              {/* Categories with Mega Menu */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 hover:bg-indigo-50 rounded-xl group"
                  onMouseEnter={() => setMegaMenuOpen(true)}
                >
                  <FiGrid className="w-4 h-4" />
                  <span>Categories</span>
                  <FiChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                
                {/* Mega Menu Dropdown */}
                <MegaMenuDropdown 
                  isVisible={megaMenuOpen}
                  categories={categories}
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  onMouseLeave={() => setMegaMenuOpen(false)}
                />
              </div>
              
              {/* Navigation Links */}
              <Link href="/products" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 hover:bg-indigo-50 rounded-xl">
                <FiPackage className="w-4 h-4" />
                <span>Products</span>
              </Link>
              <Link href="/suppliers" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 hover:bg-indigo-50 rounded-xl">
                <FiUsers className="w-4 h-4" />
                <span>Suppliers</span>
              </Link>
              <Link href="/requests" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-indigo-600 font-semibold transition-all duration-300 hover:bg-indigo-50 rounded-xl">
                <FiClipboard className="w-4 h-4" />
                <span>Post Request</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-gray-100/30">
        <div className="max-w-full mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden xs:block">WholesaleHub</span>
            </Link>

            {/* Mobile Search Input */}
            <div className="flex-1 mx-3 relative">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products, suppliers..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onKeyDown={handleMobileSearch}
                  className="w-full h-9 pl-10 pr-4 rounded-lg border border-gray-100 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="p-2 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiPackage className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100/30">
          <div className="px-4 py-6 space-y-4">
            <Link href="/requests" className="block py-2 text-gray-700 hover:text-indigo-600 transition-colors">Post Requests</Link>
            <Link href="/suppliers" className="block py-2 text-gray-700 hover:text-indigo-600 transition-colors">Find Suppliers</Link>
            <Link href="/" className="text-2xl font-bold text-white hover:text-blue-100 transition-colors">
              DukanBaz
            </Link>
            <Link href="/contact" className="block py-2 text-gray-700 hover:text-indigo-600 transition-colors">Contact</Link>
            <hr className="border-gray-100" />
            {session ? (
              <div className="space-y-2">
                <Link href="/profile" className="block py-2 text-gray-700 hover:text-indigo-600 transition-colors">Profile</Link>
                <Link href="/supplier-dashboard" className="block py-2 text-indigo-600 hover:text-indigo-700 transition-colors">Dashboard</Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/signin" className="block py-2 text-gray-700 hover:text-indigo-600 transition-colors">Sign In</Link>
                <Link href="/register" className="block py-2 text-indigo-600 hover:text-indigo-700 transition-colors font-semibold">Join Now</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
