"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from '../../contexts/CartContext';
import PageLayout from '../../components/PageLayout';
import { 
  FiMinus, 
  FiPlus, 
  FiTrash2, 
  FiHeart, 
  FiShoppingCart, 
  FiPackage, 
  FiTruck, 
  FiMapPin, 
  FiChevronDown, 
  FiChevronUp, 
  FiX,
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiShield,
  FiCreditCard,
  FiGift,
  FiPercent,
  FiLock,
  FiCheck
} from 'react-icons/fi';

// Use the proper ICartItem interface from models

interface CartItemForDisplay {
  _id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierName: string;
  supplierId: string;
  color?: string;
  size?: string;
  material?: string;
  style?: string;
  variantId?: string;
  variantName?: string;
  variationAttributes?: { name: string; value: string; }[];
  maxOrderQuantity?: number;
}

interface GroupedCartItem {
  productId: string;
  productName: string;
  productImage?: string;
  supplierId: string;
  supplierName?: string;
  items: CartItemForDisplay[];
  totalQuantity: number;
  totalPrice: number;
}

export default function CartPage() {
  const router = useRouter();
  const { items: cart, loading, error, updateQuantity, removeItem, refreshCart, totalItems } = useCart();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  // Group cart items by product only (not by variation)
  const groupedItems: GroupedCartItem[] = useMemo(() => {
    if (!cart || cart.length === 0) return [];
    
    const grouped: { [key: string]: GroupedCartItem } = {};

    (cart as CartItemForDisplay[])?.forEach((item: CartItemForDisplay) => {
      // Group by product and supplier only, not by variation
      const productKey = `${item.productId}-${item.supplierId}`;
      
      if (!grouped[productKey]) {
        grouped[productKey] = {
          productId: item.productId,
          productName: item.name || item.productName || 'Unknown Product',
          productImage: item.image || item.productImage,
          supplierId: item.supplierId,
          supplierName: item.supplier || item.supplierName,
          items: [],
          totalQuantity: 0,
          totalPrice: 0
        };
      }

      // Add item to the group (each variation as separate item)
      grouped[productKey].items.push({
        _id: item.id || item._id,
        productId: item.productId,
        productName: item.name || item.productName,
        productImage: item.image || item.productImage,
        quantity: item.quantity,
        unitPrice: item.price || item.unitPrice,
        totalPrice: item.total || item.totalPrice || (item.price || item.unitPrice) * item.quantity,
        supplierName: item.supplier || item.supplierName,
        supplierId: item.supplierId,
        color: item.color,
        size: item.size,
        material: item.material,
        style: item.style,
        variantId: item.variantId,
        variantName: item.variantName,
        variationAttributes: item.variationAttributes,
        maxOrderQuantity: item.maxOrderQuantity
      });
      
      grouped[productKey].totalQuantity += item.quantity;
      grouped[productKey].totalPrice += item.total || item.totalPrice || (item.price || item.unitPrice) * item.quantity;
    });

    return Object.values(grouped);
  }, [cart]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => setIsLoaded(true), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  // Cart data is automatically loaded by CartContext on mount

  const toggleFavorite = async (productId: number) => {
    setAddingToFavorites(productId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    
    setAddingToFavorites(null);
  };

  const updateQty = async (id: string, newQty: number) => {
    await updateQuantity(id, newQty);
  };

  const handleRemoveItem = async (id: string) => {
    setRemovingItem(id);
    await removeItem(id);
    setRemovingItem(null);
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setPromoDiscount(10);
      setPromoApplied(true);
    } else if (promoCode.toLowerCase() === "welcome15") {
      setPromoDiscount(15);
      setPromoApplied(true);
    }
  };

  const removePromoCode = () => {
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
  };

  // Calculate cart totals
  const subtotal = cart?.reduce((sum: number, item: any) => sum + ((item.price || item.unitPrice || 0) * (item.quantity || 1)), 0) || 0;
  const totalSavings = cart?.reduce((sum: number, item: any) => {
    if (item.originalPrice && (item.price || item.unitPrice)) {
      return sum + (item.originalPrice - (item.price || item.unitPrice)) * (item.quantity || 1);
    }
    return sum;
  }, 0) || 0;
  const shipping = subtotal > 20000 ? 0 : 300;
  const promoDiscountAmount = (subtotal * promoDiscount) / 100;
  const total = subtotal + shipping - promoDiscountAmount;

  if (loading) {
    return (
      <PageLayout
        title="Shopping Cart - WholesaleHub"
        description="Review your wholesale product selections and proceed to checkout"
        showHeader={true}
        showFooter={true}
        showMegaMenu={false}
        backgroundPattern="gradient"
        containerMaxWidth="full"
      >
        <div className="px-4 py-8 flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Shopping Cart - WholesaleHub"
        description="Review your wholesale product selections and proceed to checkout"
        showHeader={true}
        showFooter={true}
        showMegaMenu={false}
        backgroundPattern="gradient"
        containerMaxWidth="full"
      >
        <div className="px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Cart</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={refreshCart}
              className="btn-primary px-6 py-3"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Shopping Cart (${totalItems}) - WholesaleHub`}
      description="Review your wholesale product selections and proceed to checkout"
      showHeader={true}
      showFooter={true}
      showMegaMenu={false}
      backgroundPattern="gradient"
      containerMaxWidth="full"
      className={`transition-all duration-1000 ${typeof window !== 'undefined' && isLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
        {/* Mobile Header - Sticky */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-150 lg:hidden -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiShoppingCart className="w-5 h-5 text-blue-600" />
                Cart
                {totalItems > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded-full min-w-[24px]">
                    {totalItems}
                  </span>
                )}
              </h1>
            </div>

            <div className="w-9" /> {/* Spacer for center alignment */}
          </div>
        </div>

        <div className="px-4 py-4 lg:py-8">
          {/* Desktop Header */}
          <div className="mb-8 hidden lg:block">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-150"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FiShoppingCart className="w-8 h-8 text-blue-600" />
                  Shopping Cart
                  {totalItems > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-lg font-semibold px-3 py-1 rounded-full">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {cart?.length === 0 
                    ? 'Your cart is empty' 
                    : 'Review your items and proceed to checkout'
                  }
                </p>
              </div>
            </div>
          </div>

          {groupedItems?.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-16 lg:py-20">
              <div className="animate-fade-in">
                <FiShoppingCart className="w-20 h-20 lg:w-24 lg:h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto px-4">
                  Looks like you haven&apos;t added any products to your cart yet. Start exploring our wholesale products!
                </p>
                <div className="flex flex-col gap-3 justify-center px-4">
                  <button 
                    onClick={() => router.push('/products')}
                    className="w-full lg:w-auto btn-primary flex items-center justify-center gap-2 py-4 lg:py-3"
                  >
                    <FiPackage className="w-5 h-5" />
                    Browse Products
                  </button>
                  <button 
                    onClick={() => router.push('/categories')}
                    className="w-full lg:w-auto btn-secondary flex items-center justify-center gap-2 py-4 lg:py-3"
                  >
                    <FiArrowRight className="w-5 h-5" />
                    View Categories
              </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: Grouped Cart Items with Alibaba-style layout */}
              <div className="lg:hidden space-y-4 mb-4">
                {groupedItems?.map((group: GroupedCartItem, index: number) => {

                  return (
                    <div 
                      key={`${group.productId}-${group.supplierId}`} 
                      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-150 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Product Header */}
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {group.productImage ? (
                            <Image 
                              src={group.productImage} 
                              alt={group.productName}
                              width={64}
                              height={64}
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

                    </div>
                  );
                })}
              </div>

              {/* Desktop: Original layout */}
              <div className="hidden lg:flex lg:flex-col xl:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1">
                  <div className="card-glass p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <FiPackage className="w-5 h-5" />
                      Items in Cart ({cart?.length || 0})
                    </h2>
                    
                    <div className="space-y-4">
                      {groupedItems?.map((group: GroupedCartItem, index: number) => {

                        return (
                          <div 
                            key={`${group.productId}-${group.supplierId}`} 
                            className="card-hover p-4 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {/* Product Header */}
                            <div className="flex gap-4 mb-4">
                              {/* Product Image */}
                              <div className="relative w-24 h-24 flex-shrink-0">
                                <Image 
                                  src={group.productImage || '/placeholder-product.jpg'} 
                                  alt={group.productName} 
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                      {group.productName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                      <FiMapPin className="w-3 h-3" />
                                      <span>{group.supplierName}</span>
                                      <div className="flex items-center gap-1 text-green-600">
                                        <FiShield className="w-3 h-3" />
                                        <span className="text-xs">Verified</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => toggleFavorite(Number(group.productId))}
                                    className={`p-2 rounded-lg transition-colors ${
                                      favorites.includes(Number(group.productId))
                                        ? 'text-red-500 bg-red-50'
                                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                  >
                                    <FiHeart className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Product Summary */}
                                <div className="flex items-center justify-between">
                                  <div className="text-lg font-bold text-gray-900">
                                    PKR {(group.totalPrice || 0).toLocaleString()}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {group.totalQuantity} {group.totalQuantity === 1 ? 'piece' : 'pieces'} total
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Individual Variations */}
                            <div className="space-y-3 ml-28">
                              {group.items.map((item: CartItemForDisplay, index: number) => {
                                const getVariationDisplay = (cartItem: CartItemForDisplay) => {
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
                                    cartItem.variationAttributes.forEach((attr: { name: string; value: string; }) => {
                                      if (attr.value && attr.value !== 'default') {
                                        variationDetails.push(`${attr.name}: ${attr.value}`);
                                      }
                                    });
                                  }
                                  
                                  // Use variantName if available and no other details found
                                  if (variationDetails.length === 0 && cartItem.variantName) {
                                    variationDetails.push(cartItem.variantName);
                                  }
                                  
                                  const variationText = variationDetails.length > 0 ? variationDetails.join(', ') : 'Standard Product';
                                  return variationText;
                                };
                                
                                return (
                                  <div key={`${item._id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        {/* Color indicator */}
                                        {item.color && item.color !== 'default' && (
                                          <div 
                                            className="w-5 h-5 rounded-full border border-gray-300"
                                            style={{ backgroundColor: item.color.toLowerCase() }}
                                            title={`Color: ${item.color}`}
                                          />
                                        )}
                                        <div>
                                          <span className="text-sm font-medium text-gray-700">
                                            {getVariationDisplay(item)}
                                          </span>
                                          <div className="text-xs text-gray-500 mt-1">
                                            PKR {(item.unitPrice || 0).toLocaleString()} each • {item.quantity} pieces
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">
                                          PKR {((item.unitPrice || 0) * item.quantity).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                        <div className="flex items-center bg-gray-100 rounded-lg">
                                          <button
                                            onClick={() => updateQty(item._id, item.quantity - 1)}
                                            className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                                            disabled={item.quantity <= 1}
                                          >
                                            <FiMinus className="w-4 h-4 text-gray-600" />
                                          </button>
                                          <input
                                            type="number"
                                            min={1}
                                            max={item.maxOrderQuantity || 1000}
                                            value={item.quantity}
                                            onChange={(e) => {
                                              const newQty = parseInt(e.target.value) || 1;
                                              if (newQty !== item.quantity) {
                                                updateQty(item._id, newQty);
                                              }
                                            }}
                                            className="w-16 text-center bg-transparent border-none focus:outline-none text-gray-900 font-medium"
                                          />
                                          <button
                                            onClick={() => updateQty(item._id, item.quantity + 1)}
                                            className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                                            disabled={item.quantity >= (item.maxOrderQuantity || 1000)}
                                          >
                                            <FiPlus className="w-4 h-4 text-gray-600" />
                                          </button>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          ({item.maxOrderQuantity || 'In stock'} available)
                                        </span>
                                      </div>

                                      <button
                                        onClick={() => handleRemoveItem(item._id)}
                                        disabled={removingItem === item._id}
                                        className="flex items-center gap-1 text-red-500 hover:bg-red-50 rounded-lg px-3 py-2 transition-colors active:scale-95"
                                      >
                                        {removingItem === item._id ? (
                                          <div className="animate-spin w-4 h-4 border border-red-500 border-t-transparent rounded-full" />
                                        ) : (
                                          <FiTrash2 className="w-4 h-4" />
                                        )}
                                        <span>Remove</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Continue Shopping */}
                  <div className="text-center">
                    <button 
                      onClick={() => router.push('/products')}
                      className="btn-secondary flex items-center justify-center gap-2 mx-auto"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Continue Shopping
                    </button>
                  </div>
                </div>

                {/* Desktop Order Summary */}
                <div className="xl:w-96">
                  <div className="card-glass p-6 sticky top-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <FiCreditCard className="w-5 h-5" />
                      Order Summary
                    </h2>

                    {/* Promo Code */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FiGift className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">Promo Code</span>
                      </div>
                      
                      {!promoApplied ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 input-modern text-sm"
                          />
                          <button
                            onClick={applyPromoCode}
                            disabled={!promoCode.trim()}
                            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <FiPercent className="w-4 h-4" />
                            <span className="font-medium">
                              {promoCode.toUpperCase()} (-{promoDiscount}%)
                            </span>
                          </div>
                          <button
                            onClick={removePromoCode}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-600 mt-2">
                        Try: <code className="bg-white px-1 rounded">SAVE10</code> or <code className="bg-white px-1 rounded">WELCOME15</code>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>Rs {subtotal.toLocaleString()}</span>
                      </div>
                      
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>You save</span>
                          <span>-Rs {totalSavings.toLocaleString()}</span>
                        </div>
                      )}

                      {promoApplied && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Promo discount ({promoDiscount}%)</span>
                          <span>-Rs {promoDiscountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-gray-700">
                        <div className="flex items-center gap-2">
                          <FiTruck className="w-4 h-4" />
                          <span>Shipping</span>
                          {shipping === 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                        <span>{shipping === 0 ? 'FREE' : `Rs ${shipping.toLocaleString()}`}</span>
                      </div>
                      
                      {shipping > 0 && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                          💡 Add Rs {(20000 - subtotal).toLocaleString()} more for FREE shipping!
                        </div>
                      )}
                      
                      <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                        <span>Total</span>
                        <span>Rs {total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-6 p-3 bg-gray-50 rounded-lg">
                      <FiLock className="w-4 h-4" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>

                    {/* Checkout Button */}
                    <button 
                      onClick={() => router.push('/checkout')}
                      className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <FiCreditCard className="w-5 h-5" />
                      Proceed to Checkout
                    </button>

                    {/* Payment Methods */}
                    <div className="mt-4 text-center">
                      <div className="text-xs text-gray-500 mb-2">We accept</div>
                      <div className="flex justify-center gap-2">
                        {['Visa', 'MC', 'PayPal', 'Apple Pay'].map((method) => (
                          <div key={method} className="bg-white border rounded px-2 py-1 text-xs text-gray-600">
                            {method}
                    </div>
                  ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile: Continue Shopping Button */}
              <div className="lg:hidden text-center mb-4">
                <button 
                  onClick={() => router.push('/products')}
                  className="w-full btn-secondary flex items-center justify-center gap-2 py-4"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </button>
              </div>

              {/* Mobile: Collapsible Order Summary */}
              <div className="lg:hidden">
                {/* Summary Header - Mobile */}
                <button
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="w-full bg-white rounded-t-2xl p-4 flex items-center justify-between border-b border-gray-150 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-gray-900">Order Summary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900">Rs {total.toLocaleString()}</span>
                    {showOrderSummary ? (
                      <FiChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expandable Summary Content */}
                <div className={`bg-white transition-all duration-300 overflow-hidden ${
                  showOrderSummary ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-4 pt-0">
                    {/* Promo Code - Mobile */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <FiGift className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900 text-sm">Promo Code</span>
                      </div>
                      
                      {!promoApplied ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <button
                            onClick={applyPromoCode}
                            disabled={!promoCode.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 active:scale-95 transition-transform"
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <FiCheck className="w-4 h-4" />
                            <span className="font-medium text-sm">
                              {promoCode.toUpperCase()} (-{promoDiscount}%)
                            </span>
                          </div>
                          <button
                            onClick={removePromoCode}
                            className="text-red-500 hover:text-red-700 p-1 active:scale-95"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown - Mobile */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal ({totalItems} items)</span>
                        <span className="font-medium">Rs {subtotal.toLocaleString()}</span>
                      </div>
                      
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>You save</span>
                          <span>-Rs {totalSavings.toLocaleString()}</span>
                        </div>
                      )}

                      {promoApplied && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Promo discount ({promoDiscount}%)</span>
                          <span>-Rs {promoDiscountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-gray-700">
                        <div className="flex items-center gap-2">
                          <FiTruck className="w-4 h-4" />
                          <span>Shipping</span>
                          {shipping === 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{shipping === 0 ? 'FREE' : `Rs ${shipping.toLocaleString()}`}</span>
                      </div>
                      
                      {shipping > 0 && (
                        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Add Rs {(20000 - subtotal).toLocaleString()} more for FREE shipping!</span>
                        </div>
                      )}
                      
                      <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                        <span>Rs {total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Security Badge - Mobile */}
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-xs mb-4 p-2 bg-gray-50 rounded-lg">
                      <FiLock className="w-3 h-3" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Checkout Button - Always Visible */}
                <div className="bg-white rounded-b-2xl p-4 pt-0">
                  <button 
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
                  >
                    <FiCreditCard className="w-5 h-5" />
                    Proceed to Checkout • Rs {total.toLocaleString()}
                </button>

                  {/* Payment Methods - Mobile */}
                  <div className="mt-3 text-center">
                    <div className="text-xs text-gray-500 mb-2">We accept</div>
                    <div className="flex justify-center gap-2">
                      {['Visa', 'MC', 'PayPal', 'Apple Pay'].map((method) => (
                        <div key={method} className="bg-gray-100 border rounded px-2 py-1 text-xs text-gray-600">
                          {method}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
    </PageLayout>
  );
} 
