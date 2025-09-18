"use client";

import React from 'react';
import Link from 'next/link';
import { FiClipboard } from 'react-icons/fi';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  items?: Array<{
    productName: string;
  }>;
}

interface OrdersHoverDropdownProps {
  isVisible: boolean;
  orders?: {
    pendingCount: number;
    recent?: Order[];
  };
}

const OrdersHoverDropdown: React.FC<OrdersHoverDropdownProps> = ({ 
  isVisible, 
  orders 
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          <span className="text-sm text-gray-500">
            {(orders?.pendingCount && orders.pendingCount > 0) ? `${orders.pendingCount} pending` : 'No pending orders'}
          </span>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {orders?.recent && Array.isArray(orders.recent) && orders.recent.length > 0 ? (
          orders.recent.slice(0, 3).map((order: Order) => (
            <div key={order._id} className="p-3 border-b border-gray-25 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.items && order.items.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {order.items[0].productName}
                      {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <FiClipboard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No orders yet</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <Link 
          href="/orders" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center block"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default OrdersHoverDropdown;
