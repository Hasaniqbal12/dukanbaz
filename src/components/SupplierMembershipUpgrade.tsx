"use client";

import { useState } from 'react';
import { FiX, FiCheck, FiTruck, FiStar, FiShield, FiZap } from 'react-icons/fi';

interface SupplierMembershipUpgradeProps {
  onClose: () => void;
  onUpgrade: (tier: string) => void;
  currentTier?: string;
}

const SupplierMembershipUpgrade: React.FC<SupplierMembershipUpgradeProps> = ({
  onClose,
  onUpgrade,
  currentTier = 'basic'
}) => {
  const [selectedTier, setSelectedTier] = useState<'premium' | 'enterprise'>('premium');
  const [isProcessing, setIsProcessing] = useState(false);

  const membershipPlans = {
    premium: {
      name: 'Premium Supplier',
      price: 99,
      period: 'month',
      features: [
        'Offer dropshipping services',
        'Priority product listing',
        'Advanced analytics',
        'Bulk product management',
        'Priority customer support',
        'Featured supplier badge'
      ],
      color: 'blue',
      icon: <FiStar className="w-6 h-6" />
    },
    enterprise: {
      name: 'Enterprise Supplier',
      price: 299,
      period: 'month',
      features: [
        'All Premium features',
        'White-label dropshipping',
        'API access for integrations',
        'Dedicated account manager',
        'Custom branding options',
        'Advanced reporting & insights',
        'Multi-location inventory',
        'Priority order processing'
      ],
      color: 'purple',
      icon: <FiShield className="w-6 h-6" />
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/membership/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          paymentMethod: 'credit_card',
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: membershipPlans[selectedTier].price
        }),
      });

      if (response.ok) {
        onUpgrade(selectedTier);
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Upgrade failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Supplier Account</h2>
              <p className="text-gray-600 mt-1">Unlock dropshipping and advanced features</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {Object.entries(membershipPlans).map(([tier, plan]) => (
              <div
                key={tier}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedTier === tier
                    ? `border-${plan.color}-500 bg-${plan.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTier(tier as 'premium' | 'enterprise')}
              >
                {selectedTier === tier && (
                  <div className={`absolute -top-3 -right-3 bg-${plan.color}-500 text-white rounded-full p-2`}>
                    <FiCheck size={16} />
                  </div>
                )}
                
                <div className="flex items-center mb-4">
                  <div className={`text-${plan.color}-600 mr-3`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 ml-1">/{plan.period}</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className={`text-${plan.color}-500 mr-2 mt-0.5 flex-shrink-0`} size={16} />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <FiTruck className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Dropshipping Benefits</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Expand your business without inventory risk</li>
                  <li>• Fulfill orders directly to your customers' clients</li>
                  <li>• Increase revenue with dropshipping fees</li>
                  <li>• Access to dropshipping order management tools</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Current plan: <span className="font-medium capitalize">{currentTier}</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className={`px-6 py-2 bg-${membershipPlans[selectedTier].color}-600 text-white rounded-lg hover:bg-${membershipPlans[selectedTier].color}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
              >
                {isProcessing ? (
                  <>
                    <FiZap className="animate-spin" size={16} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Upgrade to {membershipPlans[selectedTier].name}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierMembershipUpgrade;
