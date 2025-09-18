"use client";

import React from 'react';
import Link from 'next/link';
import { 
  FiPackage, 
  FiHeart, 
  FiTruck, 
  FiShield, 
  FiSettings, 
  FiBook, 
  FiStar, 
  FiArrowRight 
} from 'react-icons/fi';

interface Category {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  subcategories: string[];
}

interface MegaMenuDropdownProps {
  isVisible: boolean;
  categories: Category[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({ 
  isVisible, 
  categories, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute left-0 top-full mt-2 w-screen max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-8">
        <div className="grid grid-cols-4 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className="group">
                <Link href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group-hover:shadow-lg">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.subcategories.length} subcategories
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="mt-3 pl-4 space-y-2">
                  {category.subcategories.slice(0, 4).map((sub, subIndex) => (
                    <Link 
                      key={subIndex} 
                      href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block text-sm text-gray-600 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200"
                    >
                      {sub}
                    </Link>
                  ))}
                  {category.subcategories.length > 4 && (
                    <Link 
                      href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      +{category.subcategories.length - 4} more
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/categories" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-semibold">
                <span>View All Categories</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/trending" className="flex items-center space-x-2 text-gray-600 hover:text-gray-700">
                <FiStar className="w-4 h-4" />
                <span>Trending Products</span>
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              <span>Over 2M+ products available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenuDropdown;
