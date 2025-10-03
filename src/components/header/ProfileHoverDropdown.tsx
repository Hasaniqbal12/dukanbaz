"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiUser, 
  FiGrid, 
  FiClipboard, 
  FiMessageCircle, 
  FiTool, 
  FiArrowRight 
} from 'react-icons/fi';

interface User {
  name?: string;
  email?: string;
}

interface ProfileHoverDropdownProps {
  isVisible: boolean;
  user?: User;
}

const ProfileHoverDropdown: React.FC<ProfileHoverDropdownProps> = ({ 
  isVisible, 
  user 
}) => {
  const router = useRouter();

  if (!isVisible) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {user?.name || 'User'}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-2">
        <Link 
          href="/profile" 
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiUser className="w-4 h-4 mr-3" />
          View Profile
        </Link>
        <Link 
          href={user?.email?.includes('supplier') ? '/supplier-dashboard' : '/dashboard'} 
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiGrid className="w-4 h-4 mr-3" />
          Dashboard
        </Link>
        <Link 
          href="/orders" 
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiClipboard className="w-4 h-4 mr-3" />
          My Orders
        </Link>
        <Link 
          href="/messages" 
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiMessageCircle className="w-4 h-4 mr-3" />
          Messages
        </Link>
        <hr className="my-2 border-gray-100" />
        <Link 
          href="/settings" 
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiTool className="w-4 h-4 mr-3" />
          Settings
        </Link>
        <button 
          onClick={() => router.push('/api/auth/signout')}
          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <FiArrowRight className="w-4 h-4 mr-3 rotate-180" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileHoverDropdown;
