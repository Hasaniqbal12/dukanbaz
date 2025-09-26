"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  FiCheckCircle, 
  FiPackage, 
  FiTruck, 
  FiMail, 
  FiPhone,
  FiMapPin,
  FiCalendar,

  FiDownload,
  FiShoppingBag
} from 'react-icons/fi';

interface OrderDetails {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  estimatedDelivery: string;
  products: Array<{
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  supplierName: string;
  createdAt: string;
}

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderIds = searchParams.get('orders')?.split(',') || [];

  useEffect(() => {
    if (orderIds.length > 0) {
      fetchOrderDetails();
    } else {
      setError('No order information found');
      setLoading(false);
    }
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders?ids=${orderIds.join(',')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setOrderDetails(data.orders[0]); // For now, show first order
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <FiCheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for your order! We've received your order and will process it shortly. 
            You'll receive email updates on your order status.
          </p>
        </div>

        {orderDetails && (
          <div className="max-w-4xl mx-auto">
            {/* Order Summary Card */}
            <div className="card-glass p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Order #{orderDetails.orderNumber}
                  </h2>
                  <p className="text-gray-600">
                    Placed on {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="text-3xl font-bold text-green-600">
                    Rs {orderDetails.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">Order Confirmed</div>
                    <div className="text-sm text-green-700">We've received your order</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <FiPackage className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-900">Processing</div>
                    <div className="text-sm text-blue-700">Preparing your items</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <FiTruck className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-900">Estimated Delivery</div>
                    <div className="text-sm text-purple-700">{orderDetails.estimatedDelivery}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {orderDetails.products.map((product, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Image
                        src={product.productImage || '/placeholder-product.jpg'}
                        alt={product.productName}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{product.productName}</h4>
                        <p className="text-gray-600">Supplier: {orderDetails.supplierName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-600">Qty: {product.quantity}</span>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              Rs {product.totalPrice.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Rs {product.unitPrice.toLocaleString()} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{orderDetails.shippingAddress.street}</p>
                    <p className="text-gray-900">
                      {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state}
                    </p>
                    <p className="text-gray-900">
                      {orderDetails.shippingAddress.postalCode}, {orderDetails.shippingAddress.country}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5" />
                    Delivery Information
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 font-medium">Estimated Delivery</p>
                    <p className="text-gray-600">{orderDetails.estimatedDelivery}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      You'll receive tracking information once your order ships
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => router.push('/orders')}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <FiPackage className="w-5 h-5" />
                View All Orders
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <FiDownload className="w-5 h-5" />
                Download Receipt
              </button>
              <button
                onClick={() => router.push('/')}
                className="btn-outline flex items-center justify-center gap-2"
              >
                <FiShoppingBag className="w-5 h-5" />
                Continue Shopping
              </button>
            </div>

            {/* Next Steps */}
            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Order Confirmation</h4>
                    <p className="text-gray-600 text-sm">You'll receive an email confirmation with your order details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Processing</h4>
                    <p className="text-gray-600 text-sm">Our supplier will prepare your items for shipment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Shipping Updates</h4>
                    <p className="text-gray-600 text-sm">We'll send you tracking information once your order ships</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Delivery</h4>
                    <p className="text-gray-600 text-sm">Your order will be delivered within {orderDetails.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                Need help with your order? Our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:support@dukanbaz.com"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FiMail className="w-5 h-5" />
                  support@dukanbaz.com
                </a>
                <a
                  href="tel:+923001234567"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FiPhone className="w-5 h-5" />
                  +92 300 123 4567
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
