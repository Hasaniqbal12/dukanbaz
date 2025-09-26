'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  FiUser, 
  FiPackage, 
  FiDollarSign, 
  FiClock, 
  FiTruck, 
  FiCheck, 
  FiX, 
  FiStar,
  FiShield,
  FiMessageCircle
} from 'react-icons/fi';

interface Bid {
  _id: string;
  bidPrice: number;
  originalPrice: number;
  quantity: number;
  message: string;
  deliveryTime: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  supplier: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    companyName?: string;
    verified: boolean;
  };
  product: {
    _id: string;
    name: string;
    images: string[];
    price: {
      selling?: number;
      wholesale?: number;
    };
    category: string;
  };
}

interface BidManagementProps {
  bids: Bid[];
  onAcceptBid: (bidId: string) => Promise<void>;
  onRejectBid: (bidId: string) => Promise<void>;
  onRefresh: () => void;
}

export default function BidManagement({ 
  bids, 
  onAcceptBid, 
  onRejectBid,
  onRefresh 
}: BidManagementProps) {
  const [loading, setLoading] = useState<string>(''); // bidId being processed
  const [error, setError] = useState<string>('');

  const pendingBids = bids.filter(bid => bid.status === 'pending');
  const acceptedBids = bids.filter(bid => bid.status === 'accepted');
  const rejectedBids = bids.filter(bid => bid.status === 'rejected');

  const handleAcceptBid = async (bidId: string) => {
    setError('');
    setLoading(bidId);
    try {
      await onAcceptBid(bidId);
      onRefresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept bid';
      setError(errorMessage);
    } finally {
      setLoading('');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    setError('');
    setLoading(bidId);
    try {
      await onRejectBid(bidId);
      onRefresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject bid';
      setError(errorMessage);
    } finally {
      setLoading('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const BidCard = ({ bid }: { bid: Bid }) => {
    const totalAmount = bid.bidPrice * bid.quantity;
    const savings = (bid.originalPrice - bid.bidPrice) * bid.quantity;
    const isProcessing = loading === bid._id;

    return (
      <div className={`border rounded-xl p-6 transition-all ${
        bid.status === 'accepted' 
          ? 'border-green-200 bg-green-50' 
          : bid.status === 'rejected'
          ? 'border-red-200 bg-red-50'
          : 'border-gray-200 bg-white hover:shadow-md'
      }`}>
        {/* Supplier Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {bid.supplier.profileImage ? (
                <Image
                  src={bid.supplier.profileImage}
                  alt={bid.supplier.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-blue-600" />
                </div>
              )}
              {bid.supplier.verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <FiShield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{bid.supplier.name}</h3>
              {bid.supplier.companyName && (
                <p className="text-sm text-gray-600">{bid.supplier.companyName}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">4.8</span>
                </div>
                {bid.supplier.verified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            bid.status === 'pending' 
              ? 'bg-yellow-100 text-yellow-700'
              : bid.status === 'accepted'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex gap-4 mb-4">
          {bid.product.images[0] && (
            <Image
              src={bid.product.images[0]}
              alt={bid.product.name}
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{bid.product.name}</h4>
            <p className="text-sm text-gray-600">{bid.product.category}</p>
            <p className="text-sm text-gray-500 mt-1">
              Original Price: PKR {(bid.originalPrice || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Bid Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiDollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Bid Price:</span>
              <span className="font-semibold text-gray-900">
                PKR {bid.bidPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiPackage className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Quantity:</span>
              <span className="font-semibold text-gray-900">{bid.quantity}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiTruck className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Delivery:</span>
              <span className="font-semibold text-gray-900">{bid.deliveryTime} days</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Submitted:</span>
              <span className="font-semibold text-gray-900">{formatDate(bid.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Total & Savings */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Amount:</span>
            <span className="text-lg font-bold text-gray-900">
              PKR {totalAmount.toLocaleString()}
            </span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-green-600">You save:</span>
              <span className="text-sm font-semibold text-green-600">
                PKR {savings.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Message */}
        {bid.message && (
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <FiMessageCircle className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Supplier Message:</p>
                <p className="text-sm text-gray-700 mt-1">{bid.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {bid.status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleRejectBid(bid._id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiX className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Reject'}
            </button>
            <button
              onClick={() => handleAcceptBid(bid._id)}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiCheck className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Accept Bid'}
            </button>
          </div>
        )}

        {bid.status === 'accepted' && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FiCheck className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Bid Accepted - Order Created</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              This bid has been accepted and an order has been automatically created. 
              Check your orders page for details.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (bids.length === 0) {
    return (
      <div className="text-center py-12">
        <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bids Yet</h3>
        <p className="text-gray-600">
          Suppliers haven&apos;t placed any bids on this request yet. 
          Check back later or share your request to get more visibility.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Pending Bids */}
      {pendingBids.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Bids ({pendingBids.length})
          </h3>
          <div className="space-y-4">
            {pendingBids.map(bid => (
              <BidCard key={bid._id} bid={bid} />
            ))}
          </div>
        </div>
      )}

      {/* Accepted Bids */}
      {acceptedBids.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Accepted Bids ({acceptedBids.length})
          </h3>
          <div className="space-y-4">
            {acceptedBids.map(bid => (
              <BidCard key={bid._id} bid={bid} />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Bids */}
      {rejectedBids.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rejected Bids ({rejectedBids.length})
          </h3>
          <div className="space-y-4">
            {rejectedBids.map(bid => (
              <BidCard key={bid._id} bid={bid} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}