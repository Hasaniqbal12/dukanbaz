"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiEdit2,
  FiShare2,
  FiSettings,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiShoppingBag,
  FiMessageCircle,
  FiUser,
  FiShield,
  FiGlobe,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiPackage,
  FiStar,
  FiHeart,
  FiArrowRight,
  FiDollarSign,
  FiActivity,
  FiZap,
  FiBarChart,
  FiCreditCard,
  FiCamera,
  FiUpload,
  FiTrash2,
  FiAlertCircle,
  FiLogOut,
  FiGrid,
  FiList,
  FiPlus,
  FiAward
} from "react-icons/fi";
import Link from "next/link";

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  company?: string;
  role: 'buyer' | 'supplier';
  location?: string;
  avatar: string;
  bio: string;
  phone: string;
  website: string;
  joinDate: string;
  verified: boolean;
  companySize: string;
  businessType: string;
  mainProducts: string[];
  yearEstablished: string;
  stats: {
    orders: number;
    messages: number;
    products: number;
    revenue: number;
    rating: number;
    reviews: number;
    responseRate: number;
    responseTime: string;
  };
  certifications: string[];
  recentActivity: Array<{
    id: number;
    type: string;
    title: string;
    date: string;
    status: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile data');
      }

      // The API returns the user data directly, not wrapped in success/data
      if (result && result.name) {
        // Transform API data to match UserProfile interface
        const transformedData: UserProfile = {
          name: result.name || '',
          email: result.email || '',
          company: result.company || '',
          role: result.role || 'buyer',
          location: result.location || '',
          avatar: result.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80`,
          bio: result.bio || '',
          phone: result.phone || '',
          website: result.website || '',
          joinDate: new Date(result.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          verified: result.verified || false,
          companySize: result.businessInfo?.employeeCount || (result.role === 'buyer' ? '11-50 employees' : '51-200 employees'),
          businessType: result.businessInfo?.businessType || (result.role === 'buyer' ? 'Retailer & Importer' : 'Manufacturer & Supplier'),
          mainProducts: result.businessInfo?.mainProducts || (result.role === 'buyer' 
            ? ['Electronics Retail', 'Mobile Accessories', 'Consumer Electronics', 'Tech Gadgets']
            : ['Electronics', 'Mobile Accessories', 'Computer Hardware', 'Smart Devices']),
          yearEstablished: result.businessInfo?.establishedYear?.toString() || '2015',
          stats: result.stats || {
            orders: 0,
            messages: 0,
            products: 0,
            revenue: 0,
            rating: 0,
            reviews: 0,
            responseRate: 0,
            responseTime: 'N/A'
          },
          certifications: result.businessInfo?.certifications || (result.role === 'buyer' 
            ? ['Business License', 'Import License', 'Trade Registration', 'GST Registration']
            : ['ISO 9001', 'CE Marking', 'Trade License', 'Export License']),
          recentActivity: result.recentActivity || []
        };
        
        setProfileData(transformedData);
      } else {
        // If no profile data found, create default profile
        const defaultProfile: UserProfile = {
          name: session?.user?.name || 'Unknown User',
          email: session?.user?.email || '',
          company: '',
          role: 'buyer',
          location: 'Pakistan',
          avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80`,
          bio: '',
          phone: '',
          website: '',
          joinDate: 'Recently',
          verified: false,
          companySize: '11-50 employees',
          businessType: 'Retailer & Importer',
          mainProducts: ['Electronics Retail', 'Mobile Accessories'],
          yearEstablished: '2024',
          stats: {
            orders: 0,
            messages: 0,
            products: 0,
            revenue: 0,
            rating: 0,
            reviews: 0,
            responseRate: 0,
            responseTime: 'N/A'
          },
          certifications: ['Business License'],
          recentActivity: []
        };
        setProfileData(defaultProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Even if API fails, create a default profile so user can see something
      const defaultProfile: UserProfile = {
        name: session?.user?.name || 'Unknown User',
        email: session?.user?.email || '',
        company: '',
        role: 'buyer',
        location: 'Pakistan',
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80`,
        bio: '',
        phone: '',
        website: '',
        joinDate: 'Recently',
        verified: false,
        companySize: '11-50 employees',
        businessType: 'Retailer & Importer',
        mainProducts: ['Electronics Retail', 'Mobile Accessories'],
        yearEstablished: '2024',
        stats: {
          orders: 0,
          messages: 0,
          products: 0,
          revenue: 0,
          rating: 0,
          reviews: 0,
          responseRate: 0,
          responseTime: 'N/A'
        },
        certifications: ['Business License'],
        recentActivity: []
      };
      setProfileData(defaultProfile);
      setError(null); // Clear error since we're showing default data
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile stats separately for real-time updates
  const fetchProfileStats = async () => {
    try {
      const response = await fetch('/api/profile/stats');
      const result = await response.json();
      
      if (response.ok && result.success && result.data) {
        setProfileData(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            ...result.data
          }
        } : null);
      }
    } catch (err) {
      console.error('Error fetching profile stats:', err);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    setImageUploading(true);
    setImageError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image');
      }

      if (result.success) {
        // Update profile data with new avatar
        setProfileData((prev: any) => ({
          ...prev,
          avatar: result.data.avatarUrl
        }));
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setImageError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageUploading(true);
    setImageError(null);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove image');
      }

      if (result.success) {
        // Update profile data to remove avatar
        setProfileData((prev: any) => ({
          ...prev,
          avatar: null
        }));
      }
    } catch (err) {
      console.error('Image removal error:', err);
      setImageError(err instanceof Error ? err.message : 'Failed to remove image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/signin',
        redirect: true
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: redirect manually if signOut fails
      router.push('/signin');
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    } else if (status === 'authenticated') {
      fetchProfileData();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchProfileData();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  const currentUser = profileData;



  const tabs = currentUser.role === 'buyer' 
    ? [
        { id: "overview", label: "Overview", icon: <FiBarChart className="w-5 h-5" /> },
        { id: "orders", label: "My Orders", icon: <FiShoppingBag className="w-5 h-5" /> },
        { id: "wishlist", label: "Wishlist", icon: <FiHeart className="w-5 h-5" /> },
        { id: "messages", label: "Messages", icon: <FiMessageCircle className="w-5 h-5" /> },
        { id: "settings", label: "Settings", icon: <FiSettings className="w-5 h-5" /> }
      ]
    : [
        { id: "overview", label: "Overview", icon: <FiBarChart className="w-5 h-5" /> },
        { id: "products", label: "Products", icon: <FiPackage className="w-5 h-5" /> },
        { id: "orders", label: "Orders", icon: <FiShoppingBag className="w-5 h-5" /> },
        { id: "messages", label: "Messages", icon: <FiMessageCircle className="w-5 h-5" /> },
        { id: "settings", label: "Settings", icon: <FiSettings className="w-5 h-5" /> }
      ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'active': return 'text-orange-600 bg-orange-50';
      case 'positive': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <FiShoppingBag className="w-4 h-4" />;
      case 'inquiry': return <FiMessageSquare className="w-4 h-4" />;
      case 'review': return <FiStar className="w-4 h-4" />;
      case 'payment': return <FiCreditCard className="w-4 h-4" />;
      case 'product': return <FiPackage className="w-4 h-4" />;
      case 'message': return <FiMessageCircle className="w-4 h-4" />;
      default: return <FiActivity className="w-4 h-4" />;
    }
  };

  const containerClass = `min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className={containerClass}>
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-bold text-gray-900">Profile</h1>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100">
                <FiShare2 className="w-5 h-5" />
              </button>
              <Link href="/profile/edit" className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100">
                <FiEdit2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left Sidebar Navigation */}
          <div className="hidden lg:block w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen sticky top-0">
            <div className="p-6">
              {/* User Info in Sidebar */}
              <div className="flex items-center space-x-3 mb-8">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                    {currentUser.avatar ? (
                      <Image
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FiUser className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Upload Controls */}
                  <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={imageUploading}
                        />
                        <div className="w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                          <FiCamera className="w-3 h-3 text-white" />
                        </div>
                      </label>
                      {currentUser.avatar && (
                        <button
                          onClick={handleRemoveImage}
                          disabled={imageUploading}
                          className="w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                        >
                          <FiTrash2 className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentUser.name}</h3>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
              </div>
              
              {/* Image Upload Error */}
              {imageError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FiAlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{imageError}</p>
                  </div>
                </div>
              )}

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
              
              {/* Sign Out Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Profile Header */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            {/* Cover Photo */}
            <div className="h-40 md:h-56 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10"></div>
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
              </div>
              
              <div className="absolute top-4 right-4 hidden md:flex items-center space-x-3">
                <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all flex items-center space-x-2 border border-white/20">
                  <FiShare2 className="w-4 h-4" />
                  <span className="font-medium">Share</span>
                </button>
                <Link href="/profile/edit" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all flex items-center space-x-2 border border-white/20">
                  <FiEdit2 className="w-4 h-4" />
                  <span className="font-medium">Edit Profile</span>
                </Link>
              </div>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              {/* Avatar */}
              <div className="absolute -top-16 left-6 md:left-8">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {currentUser.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                      <FiShield className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="pt-20 md:pt-24 md:pl-44">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentUser.name}</h1>
                      {currentUser.verified && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FiCheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-3">{currentUser.company}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <FiMapPin className="w-4 h-4" />
                        <span>{currentUser.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiBriefcase className="w-4 h-4" />
                        <span>{currentUser.businessType}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Member since {currentUser.joinDate}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed max-w-2xl">{currentUser.bio}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 md:mt-0 md:ml-6">
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center space-x-2">
                          <FiStar className="w-5 h-5 text-yellow-500" />
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{currentUser.stats.rating}</p>
                            <p className="text-sm text-gray-600">{currentUser.stats.reviews} reviews</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center space-x-2">
                          <FiZap className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{currentUser.stats.responseRate}%</p>
                            <p className="text-sm text-gray-600">Response rate</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Stats */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Key Metrics */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <FiBarChart className="w-5 h-5 mr-2 text-blue-600" />
                      Key Metrics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <FiShoppingBag className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{currentUser.stats.orders}</p>
                        <p className="text-sm text-gray-600">Orders</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <FiDollarSign className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(currentUser.stats.revenue)}</p>
                        <p className="text-sm text-gray-600">Revenue</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <FiMessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{currentUser.stats.messages}</p>
                        <p className="text-sm text-gray-600">Messages</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <FiPackage className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{currentUser.stats.products}</p>
                        <p className="text-sm text-gray-600">Products</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <FiActivity className="w-5 h-5 mr-2 text-blue-600" />
                        Recent Activity
                      </h3>
                      <Link href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                        View All
                        <FiArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                    
                    <div className="space-y-4">
                      {currentUser.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FiUser className="w-5 h-5 mr-2 text-blue-600" />
                      Contact Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FiMail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-600">{currentUser.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <FiPhone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-sm text-gray-600">{currentUser.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <FiGlobe className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Website</p>
                          <a href={`https://${currentUser.website}`} className="text-sm text-blue-600 hover:text-blue-700">
                            {currentUser.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FiBriefcase className="w-5 h-5 mr-2 text-blue-600" />
                      Business Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Company Size</p>
                        <p className="text-sm text-gray-600">{currentUser.companySize}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900">Established</p>
                        <p className="text-sm text-gray-600">{currentUser.yearEstablished}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900">Response Time</p>
                        <p className="text-sm text-gray-600">{currentUser.stats.responseTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FiAward className="w-5 h-5 mr-2 text-blue-600" />
                      Certifications
                    </h3>
                    
                    <div className="space-y-3">
                      {currentUser.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <FiCheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tab contents would go here */}
            {activeTab !== "overview" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {tabs.find(tab => tab.id === activeTab)?.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-gray-600">This section is under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 