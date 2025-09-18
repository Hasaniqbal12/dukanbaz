"use client";

import { useState, useEffect } from 'react';
import { FiTruck, FiMapPin, FiPackage, FiStar } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import MembershipUpgrade from '../MembershipUpgrade';

interface CustomerAddress {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface DropshippingOptionProps {
  isAvailable: boolean;
  fee?: number;
  onDropshippingChange: (isDropshipping: boolean, customerAddress?: CustomerAddress, instructions?: string) => void;
}

const initialCustomerAddress: CustomerAddress = {
  name: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Pakistan'
};

const DropshippingOption: React.FC<DropshippingOptionProps> = ({
  isAvailable,
  fee,
  onDropshippingChange
}) => {
  const { data: session } = useSession();
  const [isDropshipping, setIsDropshipping] = useState(false);
  const [customerAddress, setCustomerAddress] = useState<CustomerAddress>(initialCustomerAddress);
  const [dropshippingInstructions, setDropshippingInstructions] = useState('');
  const [hasDropshippingAccess, setHasDropshippingAccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [membershipTier, setMembershipTier] = useState('basic');
  const [showForm, setShowForm] = useState(false);

  // Check membership status on component mount
  useEffect(() => {
    const checkMembershipStatus = async () => {
      try {
        const response = await fetch('/api/membership/status');
        if (response.ok) {
          const data = await response.json();
          setHasDropshippingAccess(data.hasDropshippingAccess);
          setMembershipTier(data.membership.tier);
        }
      } catch (error) {
        console.error('Failed to check membership status:', error);
      }
    };

    if (session) {
      checkMembershipStatus();
    }
  }, [session]);

  if (!isAvailable) {
    return null;
  }

  const handleToggleDropshipping = (enabled: boolean) => {
    if (enabled && !hasDropshippingAccess) {
      setShowUpgradeModal(true);
      return;
    }
    
    setIsDropshipping(enabled);
    setShowForm(enabled);
    
    if (enabled) {
      onDropshippingChange(true, customerAddress, dropshippingInstructions);
    } else {
      onDropshippingChange(false);
      setCustomerAddress(initialCustomerAddress);
      setDropshippingInstructions('');
    }
  };

  const handleAddressChange = (field: keyof CustomerAddress, value: string) => {
    const updatedAddress = { ...customerAddress, [field]: value };
    setCustomerAddress(updatedAddress);
    onDropshippingChange(isDropshipping, updatedAddress, dropshippingInstructions);
  };

  const handleInstructionsChange = (instructions: string) => {
    setDropshippingInstructions(instructions);
    onDropshippingChange(isDropshipping, customerAddress, instructions);
  };

  const handleUpgradeSuccess = (tier: string) => {
    setMembershipTier(tier);
    setHasDropshippingAccess(true);
    // Refresh membership status
    window.location.reload();
  };

  return (
    <>
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiTruck className="text-blue-600 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Dropshipping Available</h3>
          {!hasDropshippingAccess && (
            <FiStar className="text-yellow-500 ml-2" size={16} title="Premium Feature" />
          )}
        </div>
        {fee && (
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            +${fee} fee
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <input
          type="checkbox"
          id="dropshipping-toggle"
          checked={isDropshipping}
          onChange={(e) => handleToggleDropshipping(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="dropshipping-toggle" className="text-sm font-medium text-gray-700">
          Enable dropshipping for this order
        </label>
      </div>

      {showForm && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <FiMapPin className="h-4 w-4 text-gray-500" />
            <h4 className="font-medium text-gray-900">Customer Delivery Address</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerAddress.name}
                onChange={(e) => handleAddressChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Customer's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerAddress.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Customer's phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={customerAddress.email}
                onChange={(e) => handleAddressChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="customer@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={customerAddress.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={customerAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                value={customerAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="State"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                value={customerAddress.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                value={customerAddress.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FiPackage className="h-4 w-4 text-gray-500" />
              <label className="block text-sm font-medium text-gray-700">
                Special Instructions (Optional)
              </label>
            </div>
            <textarea
              value={dropshippingInstructions}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any special delivery instructions for the supplier..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Dropshipping Information:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• The supplier will ship directly to your customer</li>
                  <li>• You&apos;ll receive tracking information once shipped</li>
                  <li>• Customer will receive the product with your branding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>


    {showUpgradeModal && (
      <MembershipUpgrade
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgradeSuccess}
      />
    )}
    </>
  );
};

export default DropshippingOption;
