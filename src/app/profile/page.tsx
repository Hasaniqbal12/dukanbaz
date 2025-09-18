"use client";

import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import ProfileEditModal from "@/components/ProfileEditModal";
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
  FiGlobe,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiPackage,
  FiStar,
  FiDollarSign,
  FiActivity,
  FiCamera,
  FiAlertCircle,
  FiAward
} from "react-icons/fi";

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  company?: string;
  role: 'buyer' | 'supplier';
  location?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  website?: string;
  joinDate?: string;
  verified?: boolean;
  companySize?: string;
  businessType?: string;
  mainProducts?: string[];
  yearEstablished?: string;
  stats?: {
    orders: number;
    messages: number;
    products: number;
    revenue: number;
    rating: number;
    reviews: number;
    responseRate: number;
    responseTime: string;
  };
  certifications?: string[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.email) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        if (response.ok) {
          const userData = await response.json();
          const transformedProfile = {
            name: userData.name || session.user.name || '',
            email: userData.email || session.user.email || '',
            company: userData.company || '',
            role: userData.role || 'buyer',
            bio: userData.bio || '',
            phone: userData.phone || '',
            website: userData.website || '',
            address: userData.address || '',
            avatar: userData.image || session.user.image || '/default-avatar.png',
            joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            verified: userData.verified || false,
            stats: {
              orders: 0, // Will be fetched from orders API
              messages: 0, // Will be fetched from messages API
              products: 0, // Will be fetched from products API
              revenue: 0, // Will be calculated from orders
              rating: 4.5, // Default rating
              reviews: 0,
              responseRate: 95,
              responseTime: '< 2 hours'
            }
          };
          setProfileData(transformedProfile);
          await fetchUserStats();
        } else if (response.status === 404) {
          // User profile doesn't exist, create default profile
          const newUserData = {
            name: session.user.name,
            email: session.user.email,
            role: 'buyer',
            isProfileComplete: false
          };
          
          const createResponse = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUserData)
          });
          
          if (createResponse.ok) {
            // Retry fetching after creation
            fetchProfileData();
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfileData();
    }
  }, [session]);

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        const dashboardData = data.data;
        
        // Calculate stats from real data
        const totalOrders = dashboardData.orders?.recent?.length || 0;
        const pendingOrders = dashboardData.orders?.pendingCount || 0;
        
        // For suppliers, show revenue and products; for buyers, show orders and spent
        if (profileData?.role === 'supplier') {
          setStats({
            totalOrders: totalOrders,
            totalProducts: Math.floor(Math.random() * 20) + 5, // TODO: Get from products API
            totalRevenue: Math.floor(Math.random() * 50000) + 5000, // TODO: Calculate from orders
            pendingOrders: pendingOrders,
            savedProducts: 0,
          });
        } else {
          setStats({
            totalOrders: totalOrders,
            totalSpent: Math.floor(Math.random() * 10000) + 1000, // TODO: Calculate from orders
            totalProducts: 0,
            totalRevenue: 0,
            pendingOrders: pendingOrders,
            savedProducts: Math.floor(Math.random() * 15) + 3, // TODO: Get from wishlist API
          });
        }
      }
      setProfileData(prev => prev ? { ...prev, stats } : null);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Handle profile save
  const handleProfileSave = async (formData: Record<string, any>) => {
    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        businessName: formData.company,
        description: formData.bio,
        phone: formData.phone,
        website: formData.website,
        businessType: formData.businessType,
        companySize: formData.companySize,
        foundedYear: formData.yearEstablished
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update profile data with new values
        setProfileData(prev => prev ? {
          ...prev,
          name: updatedUser.name || prev.name,
          company: updatedUser.businessName || prev.company,
          bio: updatedUser.description || prev.bio,
          phone: updatedUser.phone || prev.phone,
          website: updatedUser.website || prev.website,
          businessType: updatedUser.businessType || prev.businessType,
          companySize: updatedUser.companySize || prev.companySize,
          yearEstablished: updatedUser.foundedYear || prev.yearEstablished
        } : null);
        
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      // In a real app, you'd upload to a cloud service
      const reader = new FileReader();
      reader.onload = (e) => {
        if (profileData) {
          setProfileData({
            ...profileData,
            avatar: e.target?.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setImageUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (status === "loading" || loading) {
    return (
      <PageLayout
        title="Profile - WholesaleHub"
        description="User Profile"
        showHeader={true}
        showFooter={true}
        showMegaMenu={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      </PageLayout>
    );
  }

  if (error || !profileData) {
    return (
      <PageLayout
        title="Profile - WholesaleHub"
        description="User Profile"
        showHeader={true}
        showFooter={true}
        showMegaMenu={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h1>
            <p className="text-gray-600 mb-6">{error || 'Failed to load profile data'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'products', label: profileData.role === 'supplier' ? 'My Products' : 'Wishlist', icon: FiPackage },
    { id: 'orders', label: profileData.role === 'supplier' ? 'Sales' : 'Orders', icon: FiShoppingBag },
    { id: 'messages', label: 'Messages', icon: FiMessageCircle },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <PageLayout
      title={`${profileData.name} - Profile - WholesaleHub`}
      description={`${profileData.name}'s profile on WholesaleHub`}
      showHeader={true}
      showFooter={true}
      showMegaMenu={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Cover Photo & Profile Header */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-20" />
            <div className="absolute bottom-4 right-4">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center gap-2">
                <FiCamera className="w-4 h-4" />
                <span className="hidden sm:inline">Change Cover</span>
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-16 md:-mt-20">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                  {/* Profile Picture & Basic Info */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                        {profileData.avatar ? (
                          <Image
                            src={profileData.avatar}
                            alt={profileData.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                            {profileData.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      {/* Upload Button */}
                      <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg cursor-pointer transition-colors">
                        <FiCamera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={imageUploading}
                        />
                      </label>
                      
                      {imageUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Basic Info */}
                    <div className="text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profileData.name}</h1>
                        {profileData.verified && (
                          <FiCheckCircle className="w-6 h-6 text-blue-500" title="Verified Account" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <FiBriefcase className="w-4 h-4" />
                          <span className="capitalize">{profileData.role}</span>
                        </div>
                        {profileData.location && (
                          <div className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            <span>{profileData.location}</span>
                          </div>
                        )}
                        {profileData.joinDate && (
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            <span>Joined {profileData.joinDate}</span>
                          </div>
                        )}
                      </div>

                      {profileData.company && (
                        <p className="text-lg font-medium text-gray-800 mb-2">{profileData.company}</p>
                      )}
                      
                      {profileData.bio && (
                        <p className="text-gray-600 max-w-md">{profileData.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    
                    <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                      <FiShare2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    
                    <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                      <FiSettings className="w-4 h-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Stats & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiShoppingBag className="w-4 h-4 text-indigo-500" />
                      <span className="text-gray-600">
                        {profileData.role === 'supplier' ? 'Sales' : 'Orders'}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">{profileData.stats?.orders || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiPackage className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">
                        {profileData.role === 'supplier' ? 'Products' : 'Wishlist'}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">{profileData.stats?.products || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiMessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Messages</span>
                    </div>
                    <span className="font-semibold text-gray-900">{profileData.stats?.messages || 0}</span>
                  </div>
                  
                  {profileData.role === 'supplier' && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiStar className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-600">Rating</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {profileData.stats?.rating || 0}/5
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">Revenue</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(profileData.stats?.revenue || 0)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">{profileData.email}</span>
                  </div>
                  
                  {profileData.phone && (
                    <div className="flex items-center gap-3">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">{profileData.phone}</span>
                    </div>
                  )}
                  
                  {profileData.website && (
                    <div className="flex items-center gap-3">
                      <FiGlobe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={profileData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        {profileData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Info (for suppliers) */}
              {profileData.role === 'supplier' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                  <div className="space-y-3 text-sm">
                    {profileData.businessType && (
                      <div>
                        <span className="text-gray-500">Business Type:</span>
                        <p className="font-medium text-gray-900">{profileData.businessType}</p>
                      </div>
                    )}
                    
                    {profileData.companySize && (
                      <div>
                        <span className="text-gray-500">Company Size:</span>
                        <p className="font-medium text-gray-900">{profileData.companySize}</p>
                      </div>
                    )}
                    
                    {profileData.yearEstablished && (
                      <div>
                        <span className="text-gray-500">Established:</span>
                        <p className="font-medium text-gray-900">{profileData.yearEstablished}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profileData.certifications && profileData.certifications.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                  <div className="space-y-2">
                    {profileData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FiAward className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                            activeTab === tab.id
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-600 text-sm font-medium">Total Orders</p>
                              <p className="text-2xl font-bold text-blue-900">{profileData.stats?.orders || 0}</p>
                            </div>
                            <FiShoppingBag className="w-8 h-8 text-blue-500" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-600 text-sm font-medium">
                                {profileData.role === 'supplier' ? 'Revenue' : 'Spent'}
                              </p>
                              <p className="text-2xl font-bold text-green-900">
                                {formatCurrency(profileData.stats?.revenue || 0)}
                              </p>
                            </div>
                            <FiDollarSign className="w-8 h-8 text-green-500" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-600 text-sm font-medium">Messages</p>
                              <p className="text-2xl font-bold text-purple-900">{profileData.stats?.messages || 0}</p>
                            </div>
                            <FiMessageCircle className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-yellow-600 text-sm font-medium">Rating</p>
                              <p className="text-2xl font-bold text-yellow-900">
                                {profileData.stats?.rating || 0}/5
                              </p>
                            </div>
                            <FiStar className="w-8 h-8 text-yellow-500" />
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="text-center py-8">
                          <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No recent activity</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other tabs placeholder */}
                  {activeTab !== 'overview' && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiPackage className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                      <p className="text-gray-500">This section is under development.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Modal */}
        <ProfileEditModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          profileData={profileData}
          onSave={handleProfileSave}
          loading={saving}
        />
      </div>
    </PageLayout>
  );
}
