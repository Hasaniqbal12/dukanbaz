"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from 'next-auth/react';
import PageLayout from '../../components/PageLayout';
import BidModal from '../../components/BidModal';
import BidManagement from '../../components/BidManagement';
import ImageUpload from '../../components/ImageUpload';
import { 
  FiSearch, FiEye, FiDollarSign, FiCalendar, FiMapPin, FiTag, FiTrendingUp, FiPlus, FiSettings, FiX,
  FiCheckCircle, FiAlertCircle, FiBarChart, FiPackage, FiShoppingCart, FiSend
  } from 'react-icons/fi';

interface Request {
  _id: string;
  requestNumber: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  maxBudget: number;
  category: string;
  location: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'closed' | 'fulfilled' | 'expired' | 'bidding' | 'bid-accepted';
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  attachments?: string[];
  offerCount: number;
  bidCount: number;
  viewCount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface RequestForm {
  productName: string;
  description: string;
  quantity: string;
  unit: string;
  targetPrice: string;
  maxBudget: string;
  category: string;
  specifications: string;
  preferredBrands: string;
  urgency: string;
  location: string;
  contactMethod: string;
  additionalRequirements: string;
  attachments: File[];
  uploadedImages: Array<{ url: string; originalName?: string }>;
}



const categories = [
  "Electronics", "Apparel", "Home & Garden", "Machinery", 
  "Beauty & Personal Care", "Sports & Outdoor", "Automotive", 
  "Industrial Equipment", "Food & Beverages", "Health & Medical"
];

type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'views';

export default function RequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState<RequestForm>({
    productName: "",
    description: "",
    quantity: "",
    unit: "pieces",
    targetPrice: "",
    maxBudget: "",
    category: "",
    specifications: "",
    preferredBrands: "",
    urgency: "medium",
    location: "Pakistan",
    contactMethod: "platform",
    additionalRequirements: "",
    attachments: [],
    uploadedImages: []
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  // Advanced filters
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [onlyWithImages, setOnlyWithImages] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [statusFilter, setStatusFilter] = useState("open"); // Show only open requests by default
  // Bidding states
  const [showBidModal, setShowBidModal] = useState(false);
  const [showBidManagement, setShowBidManagement] = useState(false);
  const [supplierProducts] = useState<Product[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [supplierBids, setSupplierBids] = useState<string[]>([]); // Track request IDs supplier has bid on
  const [hideBidOn, setHideBidOn] = useState<boolean>(false);

  // Client-side filtered list (additional to server filters)
  const filteredRequests = useMemo(() => {
    let list = [...requests];
    // Client-side search refinement
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((r) =>
        (r.productName || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      );
    }
    if (onlyWithImages) {
      list = list.filter((r) => (r.attachments?.length || 0) > 0);
    }
    if (budgetMin) {
      const min = Number(budgetMin);
      list = list.filter((r) => (r.targetPrice ?? 0) >= min || (r.maxBudget ?? 0) >= min);
    }
    if (budgetMax) {
      const max = Number(budgetMax);
      list = list.filter((r) => (r.targetPrice ?? 0) <= max || (r.maxBudget ?? 0) <= max);
    }
    if (hideBidOn && supplierBids.length) {
      list = list.filter((r) => !supplierBids.includes(r._id));
    }
    return list;
  }, [requests, searchTerm, onlyWithImages, budgetMin, budgetMax, hideBidOn, supplierBids]);

  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'All' && { category: categoryFilter }),
        ...(urgencyFilter !== 'All' && { urgency: urgencyFilter.toLowerCase() }),
        ...(statusFilter !== 'All' && { status: statusFilter }),
                sortBy: sortBy === 'newest' ? 'createdAt' :
                sortBy === 'oldest' ? 'createdAt' :
                sortBy === 'price-high' ? 'targetPrice' :
                sortBy === 'price-low' ? 'targetPrice' : 'views',
        sortOrder: sortBy === 'oldest' || sortBy === 'price-low' ? 'asc' : 'desc'
      });

      const response = await fetch(`/api/requests?${params}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data.requests);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (err) {
      setError('Error loading requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchSupplierBids(); // Fetch supplier's existing bids to track which requests they've bid on
  }, [currentPage, searchTerm, categoryFilter, urgencyFilter, statusFilter, sortBy, session]);

  // Handle form submission
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      alert('Please sign in to post a request. You will be redirected to the sign-in page.');
      window.location.href = '/signin';
      return;
    }

    setSubmitting(true);
    try {
      // Convert form data to match backend API
      const requestData = {
          productName: form.productName,
          description: form.description,
        quantity: parseInt(form.quantity),
        unit: form.unit,
        targetPrice: parseFloat(form.targetPrice),
        maxBudget: form.maxBudget ? parseFloat(form.maxBudget) : parseFloat(form.targetPrice) * parseInt(form.quantity),
        category: form.category,
        specifications: form.specifications,
        preferredBrands: form.preferredBrands ? form.preferredBrands.split(',').map(brand => brand.trim()) : [],
        urgency: form.urgency,
        location: form.location,
        contactMethod: form.contactMethod,
        additionalRequirements: form.additionalRequirements,
        attachments: form.uploadedImages.map(img => img.url) // Image URLs
      };

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        await response.json();
        alert('Request posted successfully!');
        setShowForm(false);
        setForm({
          productName: "",
          description: "",
          quantity: "",
          unit: "pieces",
          targetPrice: "",
          maxBudget: "",
          category: "",
          specifications: "",
          preferredBrands: "",
          urgency: "medium",
          location: "Pakistan",
          contactMethod: "platform",
          additionalRequirements: "",
          attachments: [],
          uploadedImages: []
        });
        fetchRequests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to post request'}`);
      }
    } catch (error) {
      console.error('Error posting request:', error);
      alert('Failed to post request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };




  // Fetch supplier's existing bids to track which requests they've already bid on
  const fetchSupplierBids = async () => {
    if (!session?.user || (session.user as { role?: string })?.role !== 'supplier') {
      return;
    }
    
    try {
      const response = await fetch('/api/bids?supplierId=me');
      const data = await response.json();
      if (data.success) {
        // Extract request IDs that this supplier has already bid on
        const bidRequestIds = data.data.bids.map((bid: any) => bid.request._id || bid.request);
        setSupplierBids(bidRequestIds);
      }
    } catch (error) {
      console.error('Error fetching supplier bids:', error);
    }
  };

  // Open bid modal for suppliers
  const openBidModal = async (request: Request) => {
    setSelectedRequest(request);
    setShowBidModal(true);
    await fetchSupplierProducts();
  };

  // Open bid management for buyers
  const openBidManagement = async (request: Request) => {
    setSelectedRequest(request);
    setShowBidManagement(true);
    await fetchBids(request._id);
  };

  // Submit bid
  const handleBidSubmit = async (bidData: { requestId: string; productId: string; bidPrice: number; quantity: number; message: string; deliveryTime: number }) => {
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: bidData.requestId,
          productId: bidData.productId,
          bidPrice: bidData.bidPrice,
          quantity: bidData.quantity,
          message: bidData.message,
          deliveryTime: bidData.deliveryTime
        }),
      });

      if (response.ok) {
        setShowBidModal(false);
        alert('Bid submitted successfully!');
        await fetchRequests(); // Refresh to update bid count
        await fetchSupplierBids(); // Refresh supplier bids to update UI
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit bid');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      throw error;
    }
  };

  // Accept bid
  const handleAcceptBid = async (bidId: string) => {
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept bid');
      }

      alert('Bid accepted successfully! An order has been created.');
    } catch (error) {
      console.error('Error accepting bid:', error);
      throw error;
    }
  };

  // Reject bid
  const handleRejectBid = async (bidId: string) => {
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject bid');
      }

      alert('Bid rejected successfully.');
    } catch (error) {
      console.error('Error rejecting bid:', error);
      throw error;
    }
  };

  // Handle image upload for requests
  const handleRequestImageUpload = (imageData: { url: string; originalName?: string }) => {
    setForm(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, imageData]
    }));
  };

  // Handle image removal from requests
  const handleRequestImageRemove = async (imageUrl: string) => {
    try {
      const response = await fetch(`/api/upload?imageUrl=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setForm(prev => ({
          ...prev,
          uploadedImages: prev.uploadedImages.filter(img => img.url !== imageUrl)
        }));
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image');
    }
  };

  // Client-side refinement handled in the useMemo 'filteredRequests' above

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-gray-600 bg-gray-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'bidding': return 'text-purple-600 bg-purple-100';
      case 'bid-accepted': return 'text-blue-600 bg-blue-100';
      case 'fulfilled': return 'text-indigo-600 bg-indigo-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <PageLayout
      title="Product Requests - WholesaleHub"
      description="Browse and respond to wholesale product requests from buyers across Pakistan"
      showHeader={true}
      showFooter={true}
      showMegaMenu={true}
      backgroundPattern="gray"
      containerMaxWidth="full"
    >
        
        {/* Modern Hero Section */}
        <div className="relative bg-white -mx-4 sm:-mx-6 lg:-mx-8 mb-8 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="absolute inset-0 opacity-40">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}></div>
            </div>
          </div>
          
          <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                {/* Main Title */}
                <div className="inline-flex items-center gap-3 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  {filteredRequests.length} Active Requests
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Find Your Next
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Business Opportunity</span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  {(session?.user as any)?.role === 'supplier' 
                    ? 'Connect with verified buyers worldwide and grow your business with quality wholesale opportunities'
                    : 'Post your requirements and receive competitive quotes from trusted suppliers across Pakistan'
                  }
                </p>
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto mb-10">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FiTrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">2.5K+</div>
                    <div className="text-sm text-gray-600">Active Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FiCheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FiDollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">₨50M+</div>
                    <div className="text-sm text-gray-600">Deals Closed</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Modern Design */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {session?.user && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FiPlus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                    {(session?.user as any)?.role === 'supplier' ? 'Browse Requests' : 'Post New Request'}
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
                
                {!session?.user && (
                  <a
                    href="/signin"
                    className="group bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-gray-200"
                  >
                    <FiSettings className="w-5 h-5" />
                    Sign In to Get Started
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
                
                {session?.user && (session.user as any).role === 'buyer' && (
                  <a
                    href="/offers"
                    className="group bg-white/80 backdrop-blur-sm text-indigo-600 hover:bg-white px-6 py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2 transition-all duration-200 border border-indigo-200 hover:border-indigo-300"
                  >
                    <FiEye className="w-5 h-5" />
                    View My Offers
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Modern Filters Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Discover Opportunities
                </h2>
                <p className="text-gray-600">Filter through {filteredRequests.length} active requests to find your perfect match</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {filteredRequests.length} Live
                </div>
                <div className="text-sm text-gray-500">
                  Updated 2 min ago
                </div>
              </div>
            </div>
            
            {/* Mobile Filter Toggle */}
            <div className="block md:hidden mb-6">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiSettings className="w-5 h-5" />
                  <span>Filter Requests</span>
                  <span className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full text-xs font-bold">
                    {filteredRequests.length}
                  </span>
                </div>
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Desktop Filters - Always Visible */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Enhanced Search */}
              <div className="relative md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Search Requests</label>
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products, descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
            ))}
          </select>
              </div>

              {/* Urgency Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Priority Level</label>
                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                >
                  <option value="All">All Urgency</option>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent</option>
          </select>
        </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Request Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                >
                  <option value="All">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="fulfilled">Fulfilled</option>
                </select>
              </div>

              {/* Budget Min */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Min Budget (₨)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Max Budget */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Max Budget (₨)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Highest Budget</option>
                  <option value="price-low">Lowest Budget</option>

                  <option value="views">Most Viewed</option>
                </select>
              </div>
              
              {/* Desktop checkboxes */}
              <div className="md:col-span-2 lg:col-span-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Only with images */}
                  <div className="flex items-center">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyWithImages}
                        onChange={(e) => setOnlyWithImages(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      Only with images
                    </label>
                  </div>
                  
                  {/* Supplier: Hide requests I have bid on */}
                  {(session?.user as any)?.role === 'supplier' && (
                    <div className="flex items-center">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hideBidOn}
                          onChange={(e) => setHideBidOn(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Hide requests I have bid on
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Collapsible Filters */}
            <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              showMobileFilters ? 'max-h-screen opacity-100 mb-8' : 'max-h-0 opacity-0'
            }`}>
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search Requests</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products, descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
                    />
                  </div>
                </div>

                {/* Mobile Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Mobile Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level</label>
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                  >
                    <option value="All">All Urgency</option>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                {/* Mobile Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Request Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                  >
                    <option value="All">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="fulfilled">Fulfilled</option>
                  </select>
                </div>

                {/* Mobile Budget Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Budget (₨)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="1000"
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Budget (₨)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="50000"
                      className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                {/* Mobile Sort */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Highest Budget</option>
                    <option value="price-low">Lowest Budget</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                {/* Mobile Checkboxes */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center">
                    <label className="inline-flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyWithImages}
                        onChange={(e) => setOnlyWithImages(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                      />
                      Only show requests with images
                    </label>
                  </div>
                  
                  {(session?.user as any)?.role === 'supplier' && (
                    <div className="flex items-center">
                      <label className="inline-flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hideBidOn}
                          onChange={(e) => setHideBidOn(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                        />
                        Hide requests I have already bid on
                      </label>
                    </div>
                  )}
                </div>

                {/* Mobile Clear Filters Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('All');
                      setUrgencyFilter('All');
                      setStatusFilter('All');
                      setBudgetMin('');
                      setBudgetMax('');
                      setSortBy('newest');
                      setOnlyWithImages(false);
                      setHideBidOn(false);
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                Showing {filteredRequests.length} active request{filteredRequests.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 order-1 sm:order-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Requests</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiTrendingUp className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading requests...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <FiAlertCircle className="w-8 h-8 text-red-600" />
              <span className="ml-2 text-red-600">{error}</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <FiBarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600 mb-6">
                {(session?.user as any)?.role === 'buyer' 
                  ? 'Start by posting your first product request'
                  : 'Check back later for new buyer requests'
                }
              </p>
              {(session?.user as any)?.role === 'buyer' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                >
                  <FiPlus className="w-5 h-5" />
                  Post Request
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Project Requests - Freelancing Style */}
              <div className="space-y-6">
                {filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group relative"
                  >
                    {/* Project Header - Mobile Optimized */}
                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Buyer Avatar */}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                            {request.buyerName?.charAt(0) || 'B'}
                          </div>
                          
                          {/* Project Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-1">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors truncate">
                                {request.productName}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)} self-start sm:self-auto`}>
                                {request.urgency.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-700">by {request.buyerName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{request.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge - Mobile Optimized */}
                        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-2">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Project ID</div>
                            <div className="text-xs sm:text-sm font-mono text-gray-700">#{request.requestNumber}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Content - Mobile Optimized */}
                    <div className="p-4 sm:p-6">
                      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Left: Project Details */}
                        <div className="lg:col-span-2 space-y-4">
                          {/* Description */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Project Description</h4>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                              {request.description}
                            </p>
                          </div>
                          
                          {/* Requirements Grid - Mobile Stacked */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FiPackage className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-blue-900">Quantity Needed</span>
                              </div>
                              <div className="text-2xl font-bold text-blue-700">
                                {request.quantity.toLocaleString()} {request.unit}
                              </div>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FiDollarSign className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-green-900">Budget Range</span>
                              </div>
                              <div className="text-lg font-bold text-green-700">
                                ₨{(request.targetPrice || 0).toLocaleString()}
                                {request.maxBudget && request.maxBudget !== request.targetPrice && (
                                  <span className="text-sm font-normal"> - ₨{request.maxBudget.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Category & Tags */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                              {request.category}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <FiTag className="w-4 h-4" />
                              <span>Wholesale Request</span>
                            </div>
                          </div>
                          
                          {/* Reference Images */}
                          {request.attachments && request.attachments.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Reference Images</h4>
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {request.attachments.slice(0, 6).map((imageUrl, index) => (
                                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                                    <img
                                      src={imageUrl}
                                      alt={`Reference ${index + 1}`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                                {request.attachments.length > 6 && (
                                  <div className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                      +{request.attachments.length - 6}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Right: Project Stats & Actions */}
                        <div className="space-y-4">
                          {/* Project Stats */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Project Stats</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FiEye className="w-4 h-4" />
                                  <span>Views</span>
                                </div>
                                <span className="font-semibold text-gray-900">{request.viewCount || 0}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FiShoppingCart className="w-4 h-4" />
                                  <span>Proposals</span>
                                </div>
                                <span className="font-semibold text-indigo-600">{request.bidCount || 0}</span>
                              </div>
                              <div className="pt-2 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Deadline</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {new Date(request.expiresAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="space-y-3">
                            {/* Supplier Actions */}
                            {(session?.user as any)?.role === 'supplier' && (request.status === 'open' || request.status === 'bidding') && (
                              <div className="space-y-2">
                                {!supplierBids.includes(request._id) ? (
                                  <button
                                    onClick={() => openBidModal(request)}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                  >
                                    <FiSend className="w-5 h-5" />
                                    Send Proposal
                                  </button>
                                ) : (
                                  <div className="w-full bg-green-100 text-green-800 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-green-200">
                                    <FiCheckCircle className="w-5 h-5" />
                                    Proposal Sent
                                  </div>
                                )}
                                <p className="text-xs text-gray-500 text-center">
                                  Submit your best offer with product details
                                </p>
                              </div>
                            )}

                            {/* Buyer Actions */}
                            {session?.user && session.user.email === request.buyerEmail && (
                              <div className="space-y-2">
                                <button
                                  onClick={() => openBidManagement(request)}
                                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                  <FiEye className="w-5 h-5" />
                                  View Proposals ({request.bidCount || 0})
                                </button>
                                <p className="text-xs text-gray-500 text-center">
                                  Review and compare supplier proposals
                                </p>
                              </div>
                            )}
                            
                            {/* Guest/Other Users */}
                            {!session?.user && (
                              <div className="text-center">
                                <a
                                  href="/signin"
                                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                  <FiSettings className="w-5 h-5" />
                                  Sign in to Send Proposal
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                    Previous
                      </button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
            </div>
              )}
            </>
          )}
        </div>

        {/* Post Request Modal - Mobile-First Design */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
              {/* Modal Header with Progress */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Create Product Request</h2>
                    <p className="text-white/80 text-sm">Connect with verified suppliers worldwide</p>
                  </div>
              <button
                    onClick={() => setShowForm(false)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                    <FiX className="w-5 h-5" />
              </button>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <FiPackage className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Product Details</span>
                  </div>
                  <div className="w-8 h-0.5 bg-white/30"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <FiDollarSign className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Pricing & Quantity</span>
                  </div>
                  <div className="w-8 h-0.5 bg-white/30"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <FiSettings className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Requirements</span>
                  </div>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1: Product Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Product Information</h3>
                        <p className="text-gray-600 text-sm">Tell us what you're looking for</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          What product do you need? *
                        </label>
                <input
                  type="text"
                          required
                          value={form.productName}
                          onChange={(e) => setForm({ ...form, productName: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm"
                          placeholder="e.g., Wireless Bluetooth Headphones, Cotton T-Shirts, Office Chairs..."
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Product Category *
                        </label>
                        <select
                          required
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-lg bg-white shadow-sm"
                        >
                          <option value="">Choose a category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Detailed Requirements *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-base resize-none bg-white shadow-sm"
                          placeholder="Describe your requirements:\n• Product specifications\n• Quality standards\n• Packaging requirements\n• Delivery timeline"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Quantity & Pricing */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-green-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <FiDollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Quantity & Pricing</h3>
                        <p className="text-gray-600 text-sm">How much do you need and what's your budget?</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Quantity Needed *
                        </label>
                        <div className="relative">
                <input
                            type="number"
                  required
                            min="1"
                            value={form.quantity}
                            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-lg bg-white shadow-sm"
                            placeholder="1000"
                          />
                        </div>
                      </div>

                      {/* Unit */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Unit of Measurement *
                        </label>
                        <select
                          value={form.unit}
                          onChange={(e) => setForm({ ...form, unit: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-lg bg-white shadow-sm"
                        >
                          <option value="pieces">Pieces</option>
                          <option value="kg">Kilograms</option>
                          <option value="tons">Tons</option>
                          <option value="meters">Meters</option>
                          <option value="liters">Liters</option>
                          <option value="boxes">Boxes</option>
                          <option value="sets">Sets</option>
                          <option value="pairs">Pairs</option>
                        </select>
                      </div>

                      {/* Target Price */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Target Price per Unit (PKR) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₨</span>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={form.targetPrice}
                            onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
                            className="w-full pl-10 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-lg bg-white shadow-sm"
                            placeholder="100.00"
                          />
                        </div>
                      </div>

                      {/* Max Budget */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Maximum Budget (PKR)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₨</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.maxBudget}
                            onChange={(e) => setForm({ ...form, maxBudget: e.target.value })}
                            className="w-full pl-10 pr-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-lg bg-white shadow-sm"
                            placeholder="Auto-calculated"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Leave empty to auto-calculate based on quantity × target price</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Additional Requirements */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <FiSettings className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Additional Requirements</h3>
                        <p className="text-gray-600 text-sm">Specify your preferences and requirements</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      {/* Location */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Delivery Location *
                        </label>
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-lg bg-white shadow-sm"
                          placeholder="Pakistan"
                        />
                      </div>

                      {/* Urgency */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Urgency Level
                        </label>
                        <select
                          value={form.urgency}
                          onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-lg bg-white shadow-sm"
                        >
                          <option value="low">Low - Flexible timeline</option>
                          <option value="medium">Medium - Standard delivery</option>
                          <option value="high">High - Priority delivery</option>
                          <option value="urgent">Urgent - ASAP delivery</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6 mt-6">
                      {/* Technical Specifications */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Technical Specifications
                        </label>
                <textarea
                          rows={3}
                          value={form.specifications}
                          onChange={(e) => setForm({ ...form, specifications: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-base resize-none bg-white shadow-sm"
                          placeholder="Size, color, material, technical specs, certifications, etc."
                        />
                      </div>

                      {/* Preferred Brands */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Preferred Brands (Optional)
                        </label>
                        <input
                          type="text"
                          value={form.preferredBrands}
                          onChange={(e) => setForm({ ...form, preferredBrands: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-lg bg-white shadow-sm"
                          placeholder="Brand1, Brand2, Brand3 (comma separated)"
                        />
                      </div>

                      {/* Contact Method */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Preferred Contact Method
                        </label>
                        <select
                          value={form.contactMethod}
                          onChange={(e) => setForm({ ...form, contactMethod: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-lg bg-white shadow-sm"
                        >
                          <option value="platform">Through Platform</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>

                      {/* Reference Images */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Reference Images (Optional)
                        </label>
                        <p className="text-sm text-gray-600 mb-4">
                          Upload images to help suppliers understand your requirements better
                        </p>
                        <ImageUpload
                          type="product"
                          onUpload={handleRequestImageUpload}
                          onRemove={handleRequestImageRemove}
                          multiple={true}
                          maxFiles={5}
                          className="border-2 border-dashed border-purple-300 rounded-xl p-6 bg-purple-50"
                        />
                        {form.uploadedImages.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-green-600 font-medium">
                              ✓ {form.uploadedImages.length} image(s) uploaded
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Additional Requirements */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Additional Requirements
                        </label>
                        <textarea
                          rows={3}
                          value={form.additionalRequirements}
                          onChange={(e) => setForm({ ...form, additionalRequirements: e.target.value })}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-base resize-none bg-white shadow-sm"
                          placeholder="Delivery timeline, payment terms, certifications, packaging requirements, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 font-semibold transition-all duration-200 min-w-[140px]"
                      >
                        Cancel
                </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none min-w-[180px]"
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Posting...
                          </>
                        ) : (
                          <>
                            <FiSend className="w-5 h-5" />
                            Post Request
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-4">
                      Your request will be visible to verified suppliers worldwide
                    </p>
                  </div>
              </form>
              </div>
            </div>
          </div>
        )}



        {/* Bid Modal */}
        {showBidModal && selectedRequest && (
          <BidModal
            isOpen={showBidModal}
            onClose={() => setShowBidModal(false)}
            request={selectedRequest}
            supplierProducts={supplierProducts}
            onSubmit={handleBidSubmit}
          />
        )}

        {/* Bid Management Modal */}
        {showBidManagement && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Manage Bids</h2>
                  <p className="text-gray-600 text-sm">Request: {selectedRequest.productName}</p>
                </div>
                <button
                  onClick={() => setShowBidManagement(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <BidManagement
                  requestId={selectedRequest._id}
                  bids={bids}
                  onAcceptBid={handleAcceptBid}
                  onRejectBid={handleRejectBid}
                  onRefresh={() => fetchBids(selectedRequest._id)}
                />
              </div>
            </div>
          </div>
        )}
    </PageLayout>
  );
} 