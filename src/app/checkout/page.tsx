"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "../../contexts/CartContext";
import { 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiHome, 
  FiGlobe, 
  FiCreditCard,
  FiLock,
  FiShield,
  FiTruck,
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiPackage,
  FiDollarSign,
  FiMail,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiEdit3
} from "react-icons/fi";

interface Address {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface CustomerAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Import proper cart item interface
import { ICartItem } from '../../models/Cart';

// Helper function to get variation display
const getVariationDisplay = (item: ICartItem): string => {
  const variationDetails: string[] = [];
  
  // Check individual variation attributes first (only for regular items)
  if (item.type === 'regular') {
    if (item.color && item.color !== 'default') {
      variationDetails.push(`Color: ${item.color}`);
    }
    if (item.size && item.size !== 'default') {
      variationDetails.push(`Size: ${item.size}`);
    }
    if (item.material && item.material !== 'default') {
      variationDetails.push(`Material: ${item.material}`);
    }
    if (item.style && item.style !== 'default') {
      variationDetails.push(`Style: ${item.style}`);
    }
    
    // Fallback to variationAttributes if individual attributes not available
    if (variationDetails.length === 0 && item.variationAttributes && item.variationAttributes.length > 0) {
      item.variationAttributes.forEach((attr: { name: string; value: string; }) => {
        if (attr.value && attr.value !== 'default') {
          variationDetails.push(`${attr.name}: ${attr.value}`);
        }
      });
    }
    
    // Use variantName if available and no other details found
    if (variationDetails.length === 0 && item.variantName) {
      variationDetails.push(item.variantName);
    }
  }
  
  return variationDetails.length > 0 ? variationDetails.join(', ') : '';
};

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'paypal' | 'bank' | 'crypto';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Extended interface for cart calculations
interface ExtendedCartItem {
  _id?: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierName: string;
  supplierId: string;
  type: 'regular' | 'bid';
  // Additional properties for calculations
  price?: number;
  originalPrice?: number;
  // Regular item properties
  color?: string;
  size?: string;
  material?: string;
  style?: string;
  variantId?: string;
  variantName?: string;
  variationAttributes?: { name: string; value: string; }[];
  // Bid item properties
  requestId?: string;
  discountPercent?: number;
}

const initialAddress: Address = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "Pakistan",
  zipCode: "",
};

const initialCustomerAddress: CustomerAddress = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "Pakistan",
  zipCode: "",
};

// Use cartItems from CartContext instead of hardcoded items

const paymentMethods: PaymentMethod[] = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    type: 'paypal',
    icon: FiPhone,
    description: 'Mobile wallet payment via JazzCash'
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    type: 'paypal',
    icon: FiPhone,
    description: 'Mobile wallet payment via EasyPaisa'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    type: 'bank',
    icon: FiHome,
    description: 'HBL, UBL, MCB, Allied Bank, Meezan Bank'
  },
  {
    id: 'card',
    name: 'Debit/Credit Card',
    type: 'card',
    icon: FiCreditCard,
    description: 'Visa, Mastercard, Local Bank Cards'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    type: 'paypal',
    icon: FiDollarSign,
    description: 'Pay when you receive your order'
  }
];

const countries = [
  "Pakistan"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items: cartItems, checkout } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [address, setAddress] = useState<Address>(initialAddress);
  const [selectedPayment, setSelectedPayment] = useState<string>(paymentMethods[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [focusedField, setFocusedField] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState<unknown>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [hasExistingAddress, setHasExistingAddress] = useState(false);
  const [isDropshipping, setIsDropshipping] = useState(false);
  const [customerAddress, setCustomerAddress] = useState<CustomerAddress>(initialCustomerAddress);
  const [dropshippingInstructions, setDropshippingInstructions] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch saved address on component mount
  useEffect(() => {
    const fetchSavedAddress = async () => {
      if (!session?.user) return;
      
      try {
        setAddressLoading(true);
        const response = await fetch('/api/user/address');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.hasAddress) {
            setAddress(data.data);
            setHasExistingAddress(true);
          }
        }
      } catch (error) {
        console.error('Error fetching saved address:', error);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchSavedAddress();
  }, [session?.user]);


  const subtotal = cartItems.reduce((sum: number, item: ICartItem) => {
    const extendedItem = item as ExtendedCartItem;
    const itemPrice = extendedItem.price || item.unitPrice || 0;
    return sum + itemPrice * item.quantity;
  }, 0);
  const totalSavings = cartItems.reduce((sum: number, item: ICartItem) => {
    const extendedItem = item as ExtendedCartItem;
    const itemPrice = extendedItem.price || item.unitPrice || 0;
    const originalPrice = extendedItem.originalPrice;
    if (originalPrice && originalPrice > itemPrice) {
      return sum + (originalPrice - itemPrice) * item.quantity;
    }
    return sum;
  }, 0);
  const shipping = subtotal > 50000 ? 0 : 500; // Free shipping over PKR 50,000
  const tax = subtotal * 0.17; // 17% GST Pakistan
  const total = subtotal + shipping + tax;
  const totalItems = cartItems.reduce((sum: number, item: ICartItem) => sum + item.quantity, 0);

  function validateStep1() {
    const newErrors: Partial<Address> = {};
    
    if (!address.name.trim()) newErrors.name = "Name is required";
    if (!address.email.trim()) newErrors.email = "Email is required";
    if (!address.phone.trim()) newErrors.phone = "Phone is required";
    if (!address.address.trim()) newErrors.address = "Address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.state.trim()) newErrors.state = "State is required";
    if (!address.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof Address]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  function handleNextStep() {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  }

  function handlePrevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    // Validate address fields
    if (!validateStep1()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Save address if user opted to save it and it's new or changed
      if (saveAddress && session?.user) {
        try {
          await fetch('/api/user/address', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: address.name,
              phone: address.phone,
              address: address.address,
              city: address.city,
              state: address.state,
              country: address.country,
              zipCode: address.zipCode
            })
          });
        } catch (saveError) {
          console.error('Error saving address:', saveError);
          // Don't block checkout if address save fails
        }
      }

      // Prepare shipping address object
      const shippingAddress = {
        street: address.address,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.zipCode
      };
      
      // Call checkout API through CartContext with dropshipping data
      const result = await checkout(shippingAddress, selectedPayment, orderNotes, {
        isDropshipping,
        customerAddress: isDropshipping ? customerAddress : undefined,
        dropshippingInstructions: isDropshipping ? dropshippingInstructions : undefined
      });
      
      setOrderResult(result);
      setOrderSuccess(true);
      
      // Redirect to success page with order IDs
      const resultData = result as { orders?: { id: string }[] };
      const orderIds = resultData.orders?.map((order) => order.id).join(',') || '';
      router.push(`/checkout/success?orders=${orderIds}`);
    } catch (error) {
      alert(`Checkout failed: ${(error as Error).message}`);
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const steps = [
    { number: 1, title: "Delivery Info", icon: FiTruck },
    { number: 2, title: "Payment", icon: FiCreditCard },
    { number: 3, title: "Review", icon: FiCheck }
  ];

  return (
    <>
      <Head>
        <title>Checkout ({totalItems} items) - DukanBaz</title>
        <meta name="description" content="Complete your wholesale order with secure checkout process" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 min-h-screen py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-50"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FiShield className="w-8 h-8 text-blue-600" />
                    Secure Checkout
                  </h1>
                  <p className="text-gray-600 mt-1">Complete your order safely and securely</p>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="card-glass p-6 mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                        currentStep >= step.number 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-white border-gray-100 text-gray-400'
                      }`}>
                        {currentStep > step.number ? (
                          <FiCheck className="w-6 h-6" />
                        ) : (
                          <step.icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className={`ml-3 ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className="text-sm font-semibold">{step.title}</div>
                        <div className="text-xs">Step {step.number}</div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-8 ${
                          currentStep > step.number ? 'bg-blue-600' : 'bg-gray-100'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Delivery Information */}
                  {currentStep === 1 && (
                    <div className="card-glass p-8 animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <FiTruck className="w-6 h-6 text-blue-600" />
                          Delivery Information
                        </h2>
                        {hasExistingAddress && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <FiCheckCircle className="w-4 h-4" />
                            Address auto-filled from your profile
                          </div>
                        )}
                      </div>

                      {addressLoading && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                          <FiLoader className="w-4 h-4 text-blue-600 animate-spin" />
                          <span className="text-sm text-blue-700">Loading your saved address...</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
              <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <div className="relative">
                            <FiUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                              focusedField === 'name' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                <input
                  type="text"
                  name="name"
                  value={address.name}
                  onChange={handleChange}
                              onFocus={() => setFocusedField('name')}
                              onBlur={() => setFocusedField('')}
                              className={`input-modern pl-12 ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                              placeholder="Enter your full name (e.g., Ahmed Khan)"
                              required
                            />
                          </div>
                          {errors.name && (
                            <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.name}
                            </div>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <div className="relative">
                            <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                              focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <input
                              type="email"
                              name="email"
                              value={address.email}
                              onChange={handleChange}
                              onFocus={() => setFocusedField('email')}
                              onBlur={() => setFocusedField('')}
                              className={`input-modern pl-12 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                              placeholder="Enter your email address (e.g., ahmed@company.com)"
                  required
                />
              </div>
                          {errors.email && (
                            <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.email}
                            </div>
                          )}
                        </div>

                        {/* Phone */}
              <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <FiPhone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                              focusedField === 'phone' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                              onFocus={() => setFocusedField('phone')}
                              onBlur={() => setFocusedField('')}
                              className={`input-modern pl-12 ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                              placeholder="+92 300 1234567"
                  required
                />
              </div>
                          {errors.phone && (
                            <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.phone}
                            </div>
                          )}
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Country *
                          </label>
                          <div className="relative">
                            <FiGlobe className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                              focusedField === 'country' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <select
                              name="country"
                              value={address.country}
                              onChange={handleChange}
                              onFocus={() => setFocusedField('country')}
                              onBlur={() => setFocusedField('')}
                              className="input-modern pl-12"
                              required
                            >
                              {countries.map((country) => (
                                <option key={country} value={country}>{country}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Street Address *
                          </label>
                          <div className="relative">
                            <FiMapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                              focusedField === 'address' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                <input
                  type="text"
                  name="address"
                  value={address.address}
                  onChange={handleChange}
                              onFocus={() => setFocusedField('address')}
                              onBlur={() => setFocusedField('')}
                              className={`input-modern pl-12 ${errors.address ? 'border-red-300 focus:ring-red-500' : ''}`}
                              placeholder="123 Main Street, Apt 4B"
                  required
                />
              </div>
                          {errors.address && (
                            <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.address}
                            </div>
                          )}
                        </div>

                        {/* City */}
              <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City *
                          </label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                            className={`input-modern ${errors.city ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="New York"
                            required
                          />
                          {errors.city && (
                            <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.city}
                            </div>
                          )}
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            State/Province *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={address.state}
                            onChange={handleChange}
                            className={`input-modern ${errors.state ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="NY"
                  required
                          />
                          {errors.state && (
                            <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.state}
                            </div>
                          )}
              </div>

                        {/* ZIP Code */}
              <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ZIP/Postal Code *
                          </label>
                <input
                  type="text"
                            name="zipCode"
                            value={address.zipCode}
                  onChange={handleChange}
                            className={`input-modern ${errors.zipCode ? 'border-red-300 focus:ring-red-500' : ''}`}
                            placeholder="10001"
                  required
                          />
                          {errors.zipCode && (
                            <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.zipCode}
                            </div>
                          )}
              </div>
            </div>

                      {/* Save Address Option */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="saveAddress"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <label htmlFor="saveAddress" className="text-sm font-medium text-gray-700">
                            {hasExistingAddress ? 'Update saved address' : 'Save this address for future orders'}
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-7">
                          {hasExistingAddress 
                            ? 'Your address will be updated in your profile for next time'
                            : 'Next time you checkout, this address will be automatically filled'
                          }
                        </p>
                      </div>

                      {/* Dropshipping Option */}
                      <div className="mt-6 p-4 border-2 border-blue-100 bg-blue-50 rounded-xl">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="dropshipping"
                            checked={isDropshipping}
                            onChange={(e) => setIsDropshipping(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-2 border-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <label htmlFor="dropshipping" className="text-sm font-semibold text-gray-900 cursor-pointer">
                              Enable Dropshipping
                            </label>
                            <p className="text-xs text-gray-600 mt-1">
                              Ship directly to your customer. You provide the customer's address, and the supplier ships directly to them.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Customer Address Form (shown when dropshipping is enabled) */}
                      {isDropshipping && (
                        <div className="mt-6 p-6 border-2 border-orange-100 bg-orange-50 rounded-xl">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FiUser className="w-5 h-5 text-orange-600" />
                            Customer Delivery Address
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Provide your customer's address where the supplier should deliver the products directly.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Name */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Customer Name *
                              </label>
                              <input
                                type="text"
                                value={customerAddress.name}
                                onChange={(e) => setCustomerAddress(prev => ({ ...prev, name: e.target.value }))}
                                className="input-modern"
                                placeholder="Customer's full name"
                                required={isDropshipping}
                              />
                            </div>

                            {/* Customer Phone */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Customer Phone *
                              </label>
                              <input
                                type="tel"
                                value={customerAddress.phone}
                                onChange={(e) => setCustomerAddress(prev => ({ ...prev, phone: e.target.value }))}
                                className="input-modern"
                                placeholder="+92 300 1234567"
                                required={isDropshipping}
                              />
                            </div>

                            {/* Customer Email */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Customer Email
                              </label>
                              <input
                                type="email"
                                value={customerAddress.email}
                                onChange={(e) => setCustomerAddress(prev => ({ ...prev, email: e.target.value }))}
                                className="input-modern"
                                placeholder="customer@email.com"
                              />
                            </div>

                            {/* Customer Country */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Country *
                              </label>
                              <select
                                value={customerAddress.country}
                                onChange={(e) => setCustomerAddress(prev => ({ ...prev, country: e.target.value }))}
                                className="input-modern"
                                required={isDropshipping}
                              >
                                {countries.map((country) => (
                                  <option key={country} value={country}>{country}</option>
                                ))}
                              </select>
                            </div>

                            {/* Customer Address */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Street Address *
                              </label>
                              <input
                                type="text"
                                value={customerAddress.address}
                                onChange={(e) => setCustomerAddress(prev => ({ ...prev, address: e.target.value }))}
                                className="input-modern"
                                placeholder="Customer's street address"
                                required={isDropshipping}
                              />
                            </div>

                            {/* Customer City */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City *
                              </label>
                              <input
                                type="text"
                                value={customerAddress.city}
                                onChange={(e) => setCustomerAddress(prev => ({ ...prev, city: e.target.value }))}
                                className="input-modern"
                                placeholder="City"
                                required={isDropshipping}
                              />
                            </div>

                            {/* Customer State */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                State/Province *
                              </label>
                              <input
                                type="text"
                                value={customerAddress.state}
                                onChange={(e) => setCustomerAddress(prev => ({ ...prev, state: e.target.value }))}
                                className="input-modern"
                                placeholder="State"
                                required={isDropshipping}
                              />
                            </div>

                            {/* Customer ZIP */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ZIP/Postal Code *
                              </label>
                              <input
                                type="text"
                                value={customerAddress.zipCode}
                                onChange={(e) => setCustomerAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                                className="input-modern"
                                placeholder="ZIP Code"
                                required={isDropshipping}
                              />
                            </div>
                          </div>

                          {/* Dropshipping Instructions */}
                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Special Instructions for Supplier
                            </label>
                            <textarea
                              value={dropshippingInstructions}
                              onChange={(e) => setDropshippingInstructions(e.target.value)}
                              className="input-modern h-20 resize-none"
                              placeholder="Any special instructions for the supplier regarding packaging, delivery, or customer communication..."
                            />
                          </div>
                        </div>
                      )}

                      {/* Next Button */}
                      <div className="mt-8 flex justify-end">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="btn-primary flex items-center gap-2 px-8 py-3"
                        >
                          Continue to Payment
                          <FiArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 2 && (
                    <div className="card-glass p-8 animate-fade-in">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FiCreditCard className="w-6 h-6 text-blue-600" />
                        Payment Method
                      </h2>

                      <div className="space-y-4 mb-8">
                {paymentMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-blue-300 ${
                              selectedPayment === method.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-100 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.id}
                              checked={selectedPayment === method.id}
                              onChange={(e) => setSelectedPayment(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                              selectedPayment === method.id 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-100'
                            }`}>
                              {selectedPayment === method.id && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <method.icon className={`w-6 h-6 mr-4 ${
                              selectedPayment === method.id ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <div className="font-semibold text-gray-900">{method.name}</div>
                              <div className="text-sm text-gray-600">{method.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Order Notes */}
                      <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Order Notes (Optional)
                        </label>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="input-modern h-24 resize-none"
                          placeholder="Special instructions for your order..."
                        />
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="btn-secondary flex items-center gap-2 px-6 py-3"
                        >
                          <FiArrowLeft className="w-5 h-5" />
                          Back to Delivery
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="btn-primary flex items-center gap-2 px-8 py-3"
                        >
                          Review Order
                          <FiArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review Order */}
                  {currentStep === 3 && (
                    <div className="card-glass p-8 animate-fade-in">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FiCheck className="w-6 h-6 text-blue-600" />
                        Review Your Order
                      </h2>

                      {/* Delivery Information Review */}
                      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FiTruck className="w-5 h-5" />
                            Delivery Address
                          </h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            <FiEdit3 className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                        <div className="text-gray-700">
                          <p className="font-medium">{address.name}</p>
                          <p>{address.email}</p>
                          <p>{address.phone}</p>
                          <p>{address.address}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          <p>{address.country}</p>
                        </div>
                      </div>

                      {/* Payment Method Review */}
                      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FiCreditCard className="w-5 h-5" />
                            Payment Method
                          </h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            <FiEdit3 className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                        <div className="text-gray-700">
                          <p className="font-medium">
                            {paymentMethods.find(m => m.id === selectedPayment)?.name}
                          </p>
                          <p className="text-sm">
                            {paymentMethods.find(m => m.id === selectedPayment)?.description}
                          </p>
                        </div>
                      </div>

                      {/* Terms Agreement */}
                      <div className="mb-8 p-6 border-2 border-blue-100 bg-blue-50 rounded-xl">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="agreeTerms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-2 border-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <label htmlFor="agreeTerms" className="text-sm text-gray-700 leading-relaxed">
                            I agree to the{' '}
                            <a href="/terms" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                              Terms of Service
                            </a>
                            {' '}and{' '}
                            <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                              Privacy Policy
                            </a>
                            . I understand that this is a wholesale order and all sales are final.
                          </label>
                        </div>
                      </div>

                      {/* Security Notice */}
                      <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-xl">
                        <div className="flex items-center gap-3 text-green-700">
                          <FiShield className="w-5 h-5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold">Secure Checkout</div>
                            <div className="text-sm">Your payment information is encrypted and secure</div>
                          </div>
                        </div>
            </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="btn-secondary flex items-center gap-2 px-6 py-3"
                        >
                          <FiArrowLeft className="w-5 h-5" />
                          Back to Payment
                        </button>
            <button
              type="submit"
                          disabled={!agreeToTerms || isLoading}
                          className={`btn-primary flex items-center gap-2 px-8 py-4 text-lg font-bold ${
                            isLoading ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <FiLoader className="w-5 h-5 animate-spin" />
                              Processing Order...
                            </>
                          ) : (
                            <>
                              <FiLock className="w-5 h-5" />
                              Place Order • Rs {total.toLocaleString()}
                            </>
                          )}
            </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="card-glass p-6 sticky top-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiPackage className="w-5 h-5" />
                    Order Summary
                  </h3>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {(() => {
                      // Group items by productId + supplierId
                      const groupedItems = cartItems.reduce((groups: Record<string, ICartItem[]>, item) => {
                        const groupKey = `${item.productId}-${item.supplierId}`;
                        if (!groups[groupKey]) {
                          groups[groupKey] = [];
                        }
                        groups[groupKey].push(item);
                        return groups;
                      }, {});

                      return Object.entries(groupedItems).map(([groupKey, items]) => {
                        const firstItem = items[0];
                        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
                        const totalPrice = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
                        
                        return (
                          <div key={groupKey} className="border border-gray-200 rounded-lg p-4">
                            {/* Product Header */}
                            <div className="flex gap-3 mb-3">
                              <img 
                                src={firstItem.productImage || '/placeholder-product.jpg'} 
                                alt={firstItem.productName}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{firstItem.productName}</h4>
                                <p className="text-sm text-gray-600">{firstItem.supplierName}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-sm text-gray-500">{totalQuantity} pieces total</span>
                                  <span className="font-semibold text-gray-900">PKR {totalPrice.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Variations */}
                            {items.length > 1 && (
                              <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                                {items.map((item, index) => {
                                  const variationText = getVariationDisplay(item);
                                  return (
                                    <div key={`${item.variantId || index}`} className="flex justify-between items-center py-1">
                                      <div>
                                        {variationText && (
                                          <span className="text-sm text-blue-600">{variationText}</span>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <span className="text-sm text-gray-500">{item.quantity} pieces</span>
                                        <span className="text-sm font-medium text-gray-900 ml-2">PKR {(item.unitPrice * item.quantity).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 border-t pt-4">
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
                    
                    <div className="flex justify-between text-gray-700">
                      <span>GST (17%)</span>
                      <span>Rs {tax.toLocaleString()}</span>
            </div>
                    
                    <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
                      <span>Rs {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiShield className="w-4 h-4 text-green-600" />
                      <span>SSL Encrypted Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiTruck className="w-4 h-4 text-blue-600" />
                      <span>Free shipping on orders over Rs 20,000</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                      <span>7-day return policy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 