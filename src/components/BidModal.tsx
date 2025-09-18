'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiPackage, FiDollarSign, FiClock, FiTruck } from 'react-icons/fi';

interface Product {
  _id: string;
  title: string;
  images: string[];
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  unit: string;
}

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    _id: string;
    productName: string;
    quantity: number;
    targetPrice: number;
    maxBudget?: number;
    description: string;
    unit: string;
  };
  supplierProducts: Product[];
  onSubmit: (bidData: any) => Promise<void>;
}

export default function BidModal({ 
  isOpen, 
  onClose, 
  request, 
  supplierProducts, 
  onSubmit 
}: BidModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [bidPrice, setBidPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>(request.quantity.toString());
  const [message, setMessage] = useState<string>('');
  const [deliveryTime, setDeliveryTime] = useState<string>('7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Debug logging
  console.log('BidModal - supplierProducts:', supplierProducts);
  console.log('BidModal - supplierProducts length:', supplierProducts.length);
  console.log('BidModal - request:', request);
  
  // Check if products have the expected structure
  if (supplierProducts.length > 0) {
    console.log('BidModal - First product structure:', supplierProducts[0]);
    console.log('BidModal - First product title:', supplierProducts[0].title);
    console.log('BidModal - First product price:', supplierProducts[0].price);
  }
  
  // Show all products initially, with relevant ones first
  const relevantProducts = supplierProducts.sort((a, b) => {
    const aRelevant = a.title?.toLowerCase().includes(request.productName.toLowerCase()) ||
                     a.category?.toLowerCase().includes(request.productName.toLowerCase()) ||
                     a.description?.toLowerCase().includes(request.productName.toLowerCase());
    const bRelevant = b.title?.toLowerCase().includes(request.productName.toLowerCase()) ||
                     b.category?.toLowerCase().includes(request.productName.toLowerCase()) ||
                     b.description?.toLowerCase().includes(request.productName.toLowerCase());
    
    if (aRelevant && !bRelevant) return -1;
    if (!aRelevant && bRelevant) return 1;
    return 0;
  });
  
  console.log('BidModal - relevantProducts:', relevantProducts);
  console.log('BidModal - relevantProducts length:', relevantProducts.length);

  const selectedProductData = supplierProducts.find(p => p._id === selectedProduct);

  const totalAmount = parseFloat(bidPrice) * parseInt(quantity) || 0;
  const savingsFromTarget = (request.targetPrice * parseInt(quantity)) - totalAmount;
  const maxBudget = request.maxBudget || (request.targetPrice * request.quantity * 1.2); // Default to 20% above target

  useEffect(() => {
    if (selectedProductData) {
      const suggestedPrice = selectedProductData.price || 0;
      setBidPrice(suggestedPrice.toString());
    }
  }, [selectedProduct, selectedProductData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProduct || !bidPrice || !quantity || !deliveryTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(bidPrice) <= 0) {
      setError('Bid price must be greater than 0');
      return;
    }

    if (parseInt(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (parseInt(deliveryTime) <= 0) {
      setError('Delivery time must be greater than 0 days');
      return;
    }

    if (totalAmount > maxBudget) {
      setError(`Total amount (${totalAmount.toLocaleString()}) exceeds buyer's max budget (${maxBudget.toLocaleString()})`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        requestId: request._id,
        productId: selectedProduct,
        bidPrice: parseFloat(bidPrice),
        quantity: parseInt(quantity),
        message,
        deliveryTime: parseInt(deliveryTime)
      });
      onClose();
      // Reset form
      setSelectedProduct('');
      setBidPrice('');
      setQuantity(request.quantity.toString());
      setMessage('');
      setDeliveryTime('7');
    } catch (err: any) {
      setError(err.message || 'Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Place Your Bid</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Request Details */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="font-medium text-indigo-900 mb-2">Request Details</h3>
            <div className="space-y-2 text-sm text-indigo-800">
              <p><span className="font-medium">Product:</span> {request.productName}</p>
              <p><span className="font-medium">Quantity:</span> {request.quantity} {request.unit}</p>
              <p><span className="font-medium">Target Price:</span> PKR {request.targetPrice.toLocaleString()}/{request.unit}</p>
              <p><span className="font-medium">Max Budget:</span> PKR {maxBudget.toLocaleString()}</p>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Product <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Choose a product from your inventory</option>
                             {relevantProducts.length > 0 ? (
                 relevantProducts.map(product => (
                   <option key={product._id} value={product._id}>
                     {product.title} - PKR {product.price.toLocaleString()}
                   </option>
                 ))
               ) : (
                 <option disabled>No matching products found in your inventory</option>
               )}
            </select>
            
                         {selectedProductData && (
               <div className="mt-3 flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                 {selectedProductData.images[0] && (
                   <img
                     src={selectedProductData.images[0]}
                     alt={selectedProductData.title}
                     className="w-16 h-16 object-cover rounded-lg"
                   />
                 )}
                 <div className="flex-1">
                   <h4 className="font-medium text-gray-900">{selectedProductData.title}</h4>
                   <p className="text-sm text-gray-600 line-clamp-2">{selectedProductData.description}</p>
                   <p className="text-sm text-green-600 font-medium mt-1">
                     Current Price: PKR {selectedProductData.price.toLocaleString()}
                   </p>
                 </div>
               </div>
             )}
          </div>

          {/* Bid Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiDollarSign className="inline w-4 h-4 mr-1" />
                Your Bid Price (per {request.unit}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                <input
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {bidPrice && (
                <p className={`text-xs mt-1 ${parseFloat(bidPrice) <= request.targetPrice ? 'text-green-600' : 'text-orange-600'}`}>
                  {parseFloat(bidPrice) <= request.targetPrice 
                    ? `✓ Within target price (PKR ${request.targetPrice})`
                    : `Above target price (PKR ${request.targetPrice})`
                  }
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPackage className="inline w-4 h-4 mr-1" />
                Quantity ({request.unit}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiTruck className="inline w-4 h-4 mr-1" />
              Delivery Time (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="7"
              min="1"
              max="365"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Add any special terms, conditions, or notes for the buyer..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
          </div>

          {/* Bid Summary */}
          {bidPrice && quantity && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Bid Summary</h4>
              <div className="space-y-1 text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Unit Price:</span>
                  <span>PKR {parseFloat(bidPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{quantity} {request.unit}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>PKR {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{deliveryTime} days</span>
                </div>
                {savingsFromTarget > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Savings from target:</span>
                    <span>PKR {savingsFromTarget.toLocaleString()}</span>
                  </div>
                )}
                {totalAmount > maxBudget && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Exceeds max budget by:</span>
                    <span>PKR {(totalAmount - maxBudget).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedProduct || !bidPrice || !quantity}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}