"use client";

import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showMegaMenu?: boolean;
  className?: string;
  backgroundPattern?: 'gradient' | 'white' | 'gray';
  containerMaxWidth?: 'full' | '1200' | '7xl' | '6xl' | '5xl' | '4xl';
}

export default function PageLayout({
  children,
  title = 'WholesaleHub - Pakistan\'s Premier B2B Marketplace',
  description = 'Connect with verified suppliers and buyers across Pakistan. Find quality products, negotiate bulk deals, and grow your business.',
  showHeader = true,
  showFooter = true,
  showMegaMenu = false,
  className = '',
  backgroundPattern = 'white',
  containerMaxWidth = 'full'
}: PageLayoutProps) {
  
  const getBackgroundClasses = () => {
    switch (backgroundPattern) {
      case 'white':
        return 'bg-white';
      case 'gray':
        return 'bg-gray-50';
      case 'gradient':
      default:
        return 'bg-gradient-to-br from-slate-50 to-indigo-50';
    }
  };

  const getContainerClasses = () => {
    const maxWidths = {
      'full': 'max-w-full',
      '1200': 'max-w-[1200px]',
      '7xl': 'max-w-7xl',
      '6xl': 'max-w-6xl', 
      '5xl': 'max-w-5xl',
      '4xl': 'max-w-4xl'
    };
    return `${maxWidths[containerMaxWidth]} mx-auto px-4 sm:px-6 lg:px-8`;
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="WholesaleHub" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="WholesaleHub" />
        <meta name="keywords" content="wholesale, B2B, Pakistan, suppliers, buyers, bulk trading, business marketplace" />
      </Head>

      <div className={`min-h-screen flex flex-col ${getBackgroundClasses()}`}>
        {/* Header */}
        {showHeader && (
          <Header 
            showMegaMenu={showMegaMenu}
            className="flex-shrink-0"
          />
        )}

        {/* Main Content */}
        <main className={`flex-grow ${className}`}>
          <div className={getContainerClasses()}>
            {children}
          </div>
        </main>

        {/* Footer */}
        {showFooter && (
          <Footer />
        )}
      </div>
    </>
  );
}