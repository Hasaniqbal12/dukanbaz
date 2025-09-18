"use client";

import { useState, useEffect } from 'react';
import { FiCheck, FiMinus, FiPlus } from 'react-icons/fi';

interface VariationAttribute {
  name: string;
  values: Array<{
    name: string;
    image?: string;
    hexCode?: string;
  }>;
}

interface VariationCombination {
  attributes: Array<{
    name: string;
    value: string;
  }>;
  priceTiers: Array<{
    minQty: number;
    maxQty?: number;
    price: number;
    currency: string;
  }>;
  stock: number;
  moq: number;
  sku: string;
  leadTime: string;
  images: string[];
  available: boolean;
}

interface ProductVariationsProps {
  variations: {
    attributes: VariationAttribute[];
    combinations: VariationCombination[];
    defaultCombination?: string;
  };
  onVariationChange: (combination: VariationCombination, quantity: number) => void;
}

export default function ProductVariations({ variations, onVariationChange }: ProductVariationsProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedCombination, setSelectedCombination] = useState<VariationCombination | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceTier, setSelectedPriceTier] = useState<any>(null);

  // Initialize with default selections
  useEffect(() => {
    const defaultSelections: Record<string, string> = {};
    variations.attributes.forEach(attr => {
      if (attr.values.length > 0) {
        defaultSelections[attr.name] = attr.values[0].name;
      }
    });
    setSelectedAttributes(defaultSelections);
  }, [variations]);

  // Find matching combination when attributes change
  useEffect(() => {
    const combination = variations.combinations.find(combo => {
      return combo.attributes.every(attr => 
        selectedAttributes[attr.name] === attr.value
      );
    });
    
    if (combination) {
      setSelectedCombination(combination);
      setQuantity(Math.max(quantity, combination.moq));
      
      // Find appropriate price tier
      const tier = combination.priceTiers.find(tier => 
        quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty)
      ) || combination.priceTiers[0];
      
      setSelectedPriceTier(tier);
      onVariationChange(combination, quantity);
    }
  }, [selectedAttributes, quantity, variations.combinations, onVariationChange]);

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedCombination) {
      const validQuantity = Math.max(newQuantity, selectedCombination.moq);
      setQuantity(validQuantity);
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const renderAttributeSelector = (attribute: VariationAttribute) => {
    const isColorAttribute = attribute.name.toLowerCase() === 'color';
    
    return (
      <div key={attribute.name} className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {attribute.name}: 
          <span className="text-indigo-600 ml-1">
            {selectedAttributes[attribute.name]}
          </span>
        </h4>
        
        <div className="flex flex-wrap gap-2">
          {attribute.values.map((value) => {
            const isSelected = selectedAttributes[attribute.name] === value.name;
            
            if (isColorAttribute && value.hexCode) {
              // Color swatches
              return (
                <button
                  key={value.name}
                  onClick={() => handleAttributeSelect(attribute.name, value.name)}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-indigo-500 ring-2 ring-indigo-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: value.hexCode }}
                  title={value.name}
                >
                  {isSelected && (
                    <FiCheck className="absolute inset-0 m-auto w-4 h-4 text-white" />
                  )}
                </button>
              );
            }
            
            // Regular attribute buttons
            return (
              <button
                key={value.name}
                onClick={() => handleAttributeSelect(attribute.name, value.name)}
                className={`px-4 py-2 text-sm border rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                {value.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPricingTable = () => {
    if (!selectedCombination) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Pricing Tiers</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-600">Quantity</th>
                <th className="text-left py-2 text-gray-600">Price</th>
                <th className="text-left py-2 text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedCombination.priceTiers.map((tier, index) => {
                const isCurrentTier = quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty);
                const quantityRange = tier.maxQty 
                  ? `${tier.minQty}-${tier.maxQty}`
                  : `${tier.minQty}+`;
                
                return (
                  <tr 
                    key={index}
                    className={`border-b border-gray-100 ${
                      isCurrentTier ? 'bg-indigo-50 text-indigo-700' : ''
                    }`}
                  >
                    <td className="py-2">{quantityRange}</td>
                    <td className="py-2 font-medium">
                      {formatPrice(tier.price, tier.currency)}
                    </td>
                    <td className="py-2">
                      {isCurrentTier && formatPrice(tier.price * quantity, tier.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderQuantitySelector = () => {
    if (!selectedCombination) return null;

    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Quantity (MOQ: {selectedCombination.moq})
        </h4>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= selectedCombination.moq}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || selectedCombination.moq)}
            min={selectedCombination.moq}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        
        {selectedPriceTier && (
          <div className="mt-3 text-sm text-gray-600">
            <div>Unit Price: <span className="font-medium text-gray-900">
              {formatPrice(selectedPriceTier.price, selectedPriceTier.currency)}
            </span></div>
            <div>Total: <span className="font-medium text-indigo-600 text-lg">
              {formatPrice(selectedPriceTier.price * quantity, selectedPriceTier.currency)}
            </span></div>
          </div>
        )}
      </div>
    );
  };

  const renderCombinationInfo = () => {
    if (!selectedCombination) return null;

    return (
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">SKU:</span>
            <span className="ml-2 font-medium">{selectedCombination.sku}</span>
          </div>
          <div>
            <span className="text-gray-600">Stock:</span>
            <span className="ml-2 font-medium">{selectedCombination.stock}</span>
          </div>
          <div>
            <span className="text-gray-600">Lead Time:</span>
            <span className="ml-2 font-medium">{selectedCombination.leadTime}</span>
          </div>
          <div>
            <span className="text-gray-600">MOQ:</span>
            <span className="ml-2 font-medium">{selectedCombination.moq}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Attribute Selectors */}
      {variations.attributes.map(renderAttributeSelector)}
      
      {/* Combination Info */}
      {renderCombinationInfo()}
      
      {/* Pricing Table */}
      {renderPricingTable()}
      
      {/* Quantity Selector */}
      {renderQuantitySelector()}
    </div>
  );
}
