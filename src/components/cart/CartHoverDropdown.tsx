"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiPackage, FiMinus, FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { ICartItem } from '@/models/Cart';


interface CartHoverDropdownProps {
  isVisible: boolean;
  onClose: () => void;
}

const CartHoverDropdown: React.FC<CartHoverDropdownProps> = ({ isVisible, onClose }) => {
  const { items: cartItems, updateQuantity, removeItem } = useCart();

  // Group items by product only (not by variation) to match cart page design
  const groupedItems = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return [];
    }
    
    const groups: { [key: string]: ICartItem[] } = {};
    
    cartItems.forEach(item => {
      // Group by product and supplier only, not by variation
      const groupKey = `${item.productId}-${item.supplierId}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return Object.entries(groups).map(([key, items]) => ({
      key,
      items,
      productId: items[0].productId,
      productName: (items[0] as any).productName || (items[0] as any).name || 'Unknown Product',
      productImage: (items[0] as any).productImage || (items[0] as any).image,
      supplierId: items[0].supplierId,
      supplierName: (items[0] as any).supplierName || (items[0] as any).supplier,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + ((item as any).totalPrice || ((item as any).unitPrice * item.quantity)), 0)
    }));
  }, [cartItems]);

  const totalItems = cartItems?.reduce((sum: number, item: ICartItem) => sum + item.quantity, 0) || 0;
  const totalAmount = cartItems?.reduce((sum: number, item: ICartItem) => sum + ((item as any).totalPrice || ((item as any).unitPrice * item.quantity)), 0) || 0;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };


  if (!isVisible) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiShoppingCart className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Shopping Cart</h3>
          </div>
          <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-h-80 overflow-y-auto">
        {groupedItems.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {groupedItems.slice(0, 3).map((group: any) => (
              <div key={`${group.productId}-${group.supplierId}`} className="p-4">
                {/* Product Header */}
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {group.productImage ? (
                      <img 
                        src={group.productImage} 
                        alt={group.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {group.productName}
                    </h4>
                    {group.supplierName && (
                      <p className="text-xs text-gray-500 mb-2">
                        by {group.supplierName}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-orange-600">
                        PKR {(group.totalPrice || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {group.totalQuantity} {group.totalQuantity === 1 ? 'piece' : 'pieces'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Variations */}
                <div className="space-y-2 ml-19">
                  {group.items.map((item: any, index: number) => {
                    const variationKey = `${item._id}-${index}`;
                    const mainItem = item;
                    
                    // Get variation display for this specific item
                    const getItemVariationDisplay = (cartItem: any) => {
                      const variationDetails = [];
                      
                      // Use individual variation attributes with labels
                      if (cartItem.color && cartItem.color !== 'default') {
                        variationDetails.push(`Color: ${cartItem.color}`);
                      }
                      if (cartItem.size && cartItem.size !== 'default') {
                        variationDetails.push(`Size: ${cartItem.size}`);
                      }
                      if (cartItem.material && cartItem.material !== 'default') {
                        variationDetails.push(`Material: ${cartItem.material}`);
                      }
                      if (cartItem.style && cartItem.style !== 'default') {
                        variationDetails.push(`Style: ${cartItem.style}`);
                      }
                      
                      // Fallback to variationAttributes if individual attributes not available
                      if (variationDetails.length === 0 && cartItem.variationAttributes && cartItem.variationAttributes.length > 0) {
                        cartItem.variationAttributes.forEach((attr: { name: string; value: string }) => {
                          if (attr.value && attr.value !== 'default') {
                            variationDetails.push(`${attr.name}: ${attr.value}`);
                          }
                        });
                      }
                      
                      // Use variantName if available and no other details found
                      if (variationDetails.length === 0 && cartItem.variantName) {
                        variationDetails.push(cartItem.variantName);
                      }
                      
                      return variationDetails.length > 0 ? variationDetails.join(', ') : 'Standard Product';
                    };
                    
                    return (
                      <div key={variationKey} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {/* Color indicator */}
                            {mainItem.color && mainItem.color !== 'default' && (
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: mainItem.color.toLowerCase() }}
                                title={`Color: ${mainItem.color}`}
                              />
                            )}
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-700">
                                {getItemVariationDisplay(item)}
                              </span>
                              <div className="text-xs text-gray-500">
                                PKR {(mainItem.unitPrice || 0).toLocaleString()} each • {item.quantity} pieces
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleQuantityChange(mainItem._id, mainItem.quantity - 1)}
                            className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                          >
                            <FiMinus className="w-2 h-2" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={mainItem.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              handleQuantityChange(mainItem._id, newQty);
                            }}
                            className="w-10 text-xs text-center border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:border-orange-400"
                          />
                          <button
                            onClick={() => handleQuantityChange(mainItem._id, mainItem.quantity + 1)}
                            className="w-5 h-5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center transition-colors"
                          >
                            <FiPlus className="w-2 h-2" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {groupedItems.length > 3 && (
              <div className="p-4 text-center border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  +{groupedItems.length - 3} more {groupedItems.length - 3 === 1 ? 'product' : 'products'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-2">Your cart is empty</p>
            <p className="text-xs text-gray-400">Add some products to get started</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {groupedItems.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Subtotal:</span>
            <span className="text-lg font-bold text-gray-900">
              PKR {(totalAmount || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex space-x-2">
            <Link 
              href="/cart" 
              className="flex-1 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-center text-sm"
              onClick={onClose}
            >
              View Cart
            </Link>
            <Link 
              href="/checkout" 
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center text-sm flex items-center justify-center space-x-1"
              onClick={onClose}
            >
              <span>Checkout</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartHoverDropdown;
