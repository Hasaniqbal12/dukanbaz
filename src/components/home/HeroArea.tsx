"use client";

import { FiSearch, FiCamera } from "react-icons/fi";
import { useState } from "react";

// Alibaba-style full-width hero banner with overlay text and search
// Matches actual Alibaba homepage layout

const frequentSearches = [
  "iphones 15 pro max",
  "labubu", 
  "watch for men",
  "earbuds"
];

export default function HeroArea() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative h-[500px] lg:h-[600px] bg-gradient-to-r from-gray-900/80 to-gray-800/60 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&h=800&fit=crop&crop=center')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-800/50" />
      
      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        {/* Learn about Alibaba.com link */}
        <div className="mb-8">
          <button className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
            <div className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-white/80 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
            </div>
            Learn about WholesaleHub
          </button>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white mb-8 max-w-4xl leading-tight">
          The leading B2B ecommerce platform for
          <br />
          <span className="font-normal">global trade</span>
        </h1>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full h-12 pl-4 pr-24 rounded-full border-0 text-gray-900 placeholder-gray-500 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
            />
            <button className="absolute right-1 top-1 h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <FiCamera className="w-5 h-5 text-gray-600" />
            </button>
            <button className="absolute right-12 top-1 h-10 px-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors flex items-center gap-2">
              <FiSearch className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Frequently Searched */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-white/80 text-sm">Frequently searched:</span>
          {frequentSearches.map((term) => (
            <button
              key={term}
              className="px-4 py-1.5 rounded-full border border-white/30 text-white/90 hover:text-white hover:border-white/50 text-sm transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
