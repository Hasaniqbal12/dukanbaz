'use client';

import { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

interface MembershipUpgradeProps {
  onClose: () => void;
  onUpgrade: (tier: string) => void;
}

const MembershipUpgrade: React.FC<MembershipUpgradeProps> = ({ onClose, onUpgrade }) => {
  const [selectedTier, setSelectedTier] = useState<'premium' | 'enterprise'>('premium');
  const [isProcessing, setIsProcessing] = useState(false);

  const membershipPlans = {
    premium: {
      name: 'Premium',
      price: 29,
      features: [
        'Dropshipping Access',
        'Bulk Order Discounts',
        'Priority Support',
        'Advanced Order Management'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: 99,
      features: [
        'All Premium Features',
        'Custom Branding',
        'Advanced Analytics',
        'Dedicated Account Manager',
        'API Access'
      ]
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
          transactionId: `txn_${Date.now()}`,
          amount: membershipPlans[selectedTier].price
        }),
      });

      if (response.ok) {
        onUpgrade(selectedTier);
        onClose();
      } else {
        const error = await response.json();
        alert(`Upgrade failed: ${error.error}`);
      }
    } catch (error) {
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiCrown className="mr-2 text-yellow-500" />
            Upgrade to Premium
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Unlock dropshipping capabilities and advanced features with our premium membership plans.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {Object.entries(membershipPlans).map(([tier, plan]) => (
            <div
              key={tier}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedTier === tier
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTier(tier as 'premium' | 'enterprise')}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">${plan.price}</div>
                  <div className="text-sm text-gray-500">/month</div>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {tier === 'premium' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    🚀 Most Popular for Dropshipping
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Upgrade to ${membershipPlans[selectedTier].name}`}
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>• All plans include a 30-day money-back guarantee</p>
          <p>• Cancel anytime from your account settings</p>
          <p>• Prices shown in USD, billed monthly</p>
        </div>
      </div>
    </div>
  );
};

export default MembershipUpgrade;
