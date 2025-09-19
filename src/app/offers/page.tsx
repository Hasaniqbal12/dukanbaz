"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { 
  FiPackage, FiCalendar, FiDollarSign, FiClock, 
  FiUser, FiMessageCircle, FiCheck, FiX, FiTrendingUp
} from 'react-icons/fi';

interface Offer {
  _id: string;
  requestId: string;
  supplierId: string;
  price: string;
  moq: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function OffersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    // Temporarily disabled authentication for testing
    // if (status === 'loading') return;
    
    // if (!session?.user) {
    //   router.push('/signin');
    //   return;
    // }

    // if ((session.user as any).role !== 'buyer') {
    //   router.push('/');
    //   return;
    // }

    fetchOffers();
  }, [session, status, router]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/offers');
      const data = await response.json();

      if (data.success) {
        setOffers(data.data.offers);
      } else {
        setError('Failed to fetch offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' }),
      });

      if (response.ok) {
        await fetchOffers(); // Refresh offers
        alert(`Offer ${action}ed successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || `Failed to ${action} offer`}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing offer:`, error);
      alert(`Failed to ${action} offer. Please try again.`);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <FiTrendingUp className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Received Offers</h1>
          <p className="text-gray-600">View and manage offers received for your product requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Offers', count: offers.length },
                { key: 'pending', label: 'Pending', count: offers.filter(o => o.status === 'pending').length },
                { key: 'accepted', label: 'Accepted', count: offers.filter(o => o.status === 'accepted').length },
                { key: 'rejected', label: 'Rejected', count: offers.filter(o => o.status === 'rejected').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiTrendingUp className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading offers...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FiX className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchOffers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You haven't received any offers yet. Post some requests to get started!"
                : `No ${filter} offers found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOffers.map((offer) => (
              <div key={offer._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                {/* Offer Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Supplier ID: {offer.supplierId}</h3>
                        <p className="text-sm text-gray-500">
                          Offer for Request: <span className="font-medium text-gray-900">{offer.requestId}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(offer.status)}`}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Pricing */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Pricing</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900 mb-1">
                        ₨{parseFloat(offer.price).toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">
                        Total Price | MOQ: {offer.moq} units
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiClock className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Status</span>
                      </div>
                      <div className="text-lg font-semibold text-blue-900 mb-1">
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </div>
                      <div className="text-sm text-blue-700">Current status</div>
                    </div>

                    {/* Created */}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiCalendar className="w-5 h-5 text-orange-600" />
                        <span className="font-medium text-orange-800">Created</span>
                      </div>
                      <div className="text-lg font-semibold text-orange-900 mb-1">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-orange-700">Offer date</div>
                    </div>
                  </div>

                  {/* Message */}
                  {offer.message && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <FiMessageCircle className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-800">Message from Supplier</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">{offer.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Offer Details */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">Offer Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Request ID:</span>
                        <div className="font-medium text-gray-900 font-mono text-xs">{offer.requestId}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Supplier ID:</span>
                        <div className="font-medium text-gray-900 font-mono text-xs">{offer.supplierId}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Updated:</span>
                        <div className="font-medium text-gray-900">{new Date(offer.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {offer.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOfferAction(offer._id, 'accept')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <FiCheck className="w-5 h-5" />
                        Accept Offer
                      </button>
                      <button
                        onClick={() => handleOfferAction(offer._id, 'reject')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                        Reject Offer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
