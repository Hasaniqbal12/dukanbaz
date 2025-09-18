"use client";

import React from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  pageTitle: string;
  pageDescription?: string;
  showBackButton?: boolean;
  backUrl?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  title = 'Dashboard - WholesaleHub',
  description = 'Manage your business operations and monitor performance on Pakistan\'s leading B2B platform.',
  pageTitle,
  pageDescription,
  showBackButton = false,
  backUrl = '/',
  className = '',
  headerActions
}: DashboardLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Dashboard specific meta tags */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="author" content="WholesaleHub" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        {/* Dashboard Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <button
                    onClick={() => router.push(backUrl)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FiArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pageTitle}</h1>
                    {session?.user?.role && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full capitalize">
                        {session.user.role}
                      </span>
                    )}
                  </div>
                  {pageDescription && (
                    <p className="text-gray-600 text-sm sm:text-base">{pageDescription}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {headerActions}
                
                {/* Quick Navigation */}
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiHome className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </button>

                {/* User Info */}
                {session?.user && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{session.user.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
          {children}
        </main>
      </div>
    </>
  );
}