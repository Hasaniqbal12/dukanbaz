"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBarChart,
  FiPlus,
  FiGrid,
  FiClipboard,
  FiMessageCircle,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX
} from "react-icons/fi";

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole?: 'supplier' | 'buyer';
}

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen, userRole = 'supplier' }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/supplier-dashboard",
      icon: FiBarChart,
      label: "Dashboard",
      roles: ['supplier']
    },
    {
      href: "/add-product",
      icon: FiPlus,
      label: "Add Product",
      roles: ['supplier']
    },
    {
      href: "/seller/manage-products",
      icon: FiGrid,
      label: "Manage Products",
      roles: ['supplier']
    },
    {
      href: "/seller/orders",
      icon: FiClipboard,
      label: "Orders",
      roles: ['supplier']
    },
    {
      href: "/chat",
      icon: FiMessageCircle,
      label: "Messages",
      roles: ['supplier', 'buyer'],
      badge: "3"
    },
    {
      href: "/profile",
      icon: FiUser,
      label: "Profile",
      roles: ['supplier', 'buyer']
    },
    {
      href: "/settings",
      icon: FiSettings,
      label: "Settings",
      roles: ['supplier', 'buyer']
    }
  ];

  const filteredItems = navigationItems.filter(item => item.roles.includes(userRole));

  const isActive = (href: string) => {
    if (href === "/supplier-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-white">
          <h1 className="text-lg font-semibold text-gray-900">
            DukanBaz
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-6 space-y-1">
          {filteredItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`${
                  active 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
              >
                <IconComponent className={`${
                  active ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600'
                } mr-3 flex-shrink-0 h-4 w-4`} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-full p-6">
          <button 
            onClick={() => window.location.href = '/api/auth/signout'}
            className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
          >
            <FiLogOut className="text-gray-400 group-hover:text-gray-600 mr-3 flex-shrink-0 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
