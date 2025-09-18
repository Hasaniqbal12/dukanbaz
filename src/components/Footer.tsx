"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiArrowRight,
  FiShield,
  FiTruck,
  FiCreditCard,
  FiGlobe,
  FiHeart
} from "react-icons/fi";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail("");
      // You can add success message here
    }, 1000);
  };

  const footerLinks = {
    "About DukanBaz": [
      { name: "About Us", href: "/about" },
      { name: "How It Works", href: "/how-it-works" },
      { name: "Success Stories", href: "/success-stories" },
      { name: "Press & Media", href: "/press" },
      { name: "Careers in Pakistan", href: "/careers" },
      { name: "Contact Us", href: "/contact" }
    ],
    "For Buyers": [
      { name: "Post Requests", href: "/requests" },
      { name: "Find Pakistan Suppliers", href: "/suppliers" },
      { name: "Buyer Guide", href: "/buyer-guide" },
      { name: "Quality Assurance", href: "/quality" },
      { name: "Trade Assurance", href: "/trade-assurance" },
      { name: "Pakistan Markets", href: "/markets" }
    ],
    "For Suppliers": [
      { name: "Sell on DukanBaz", href: "/sell" },
      { name: "Supplier Dashboard", href: "/supplier-dashboard" },
      { name: "Seller Central", href: "/seller-central" },
      { name: "Advertising", href: "/advertising" },
      { name: "Business Verification", href: "/verification" },
      { name: "Success Tools", href: "/tools" }
    ],
    "Help & Support": [
      { name: "Help Center", href: "/help" },
      { name: "Customer Service", href: "/support" },
      { name: "Dispute Resolution", href: "/disputes" },
      { name: "Payment Help", href: "/payment-help" },
      { name: "Pakistan Shipping", href: "/shipping" },
      { name: "Returns & Refunds", href: "/returns" }
    ]
  };

  const categories = [
    "Electronics", "Fashion & Apparel", "Home & Garden", "Sports & Fitness",
    "Beauty & Personal Care", "Food & Beverages", "Automotive", "Industrial Machinery"
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay Connected</h3>
              <p className="text-gray-300 text-lg">
                Get the latest deals, new products, and Pakistan market insights delivered to your inbox.
              </p>
            </div>
            <div>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-12 pl-12 pr-4 bg-gray-800 border border-gray-500 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-6 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500 rounded-xl font-semibold flex items-center gap-2 transition-all transform hover:scale-105 disabled:transform-none"
                >
                  {isSubscribing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-2xl font-bold text-gradient">DukanBaz</span>
            </Link>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Pakistan&apos;s premier B2B Marketplace. Connect with verified suppliers and buyers across Pakistan. 
              Discover quality products, build lasting partnerships, and grow your business with confidence.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <FiPhone className="w-4 h-4 text-indigo-400" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <FiMail className="w-4 h-4 text-indigo-400" />
                <span>support@dukanbaz.com</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300">
                <FiMapPin className="w-4 h-4 text-indigo-400 mt-0.5" />
                <span>Business District, Lahore, Pakistan</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: FiFacebook, href: "#", label: "Facebook" },
                { icon: FiTwitter, href: "#", label: "Twitter" },
                { icon: FiInstagram, href: "#", label: "Instagram" },
                { icon: FiLinkedin, href: "#", label: "LinkedIn" },
                { icon: FiYoutube, href: "#", label: "YouTube" }
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      <span>{link.name}</span>
                      <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular Industries in Pakistan */}
        <div className="mt-16 pt-8 border-t border-gray-600">
          <h4 className="font-semibold text-white mb-4">Popular Industries in Pakistan</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Secure Trading</div>
                <div className="text-sm">100% Protected</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FiTruck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Fast Shipping</div>
                <div className="text-sm">Pakistan Delivery</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 bg-indigo-700 rounded-lg flex items-center justify-center">
                <FiCreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Secure Payment</div>
                <div className="text-sm">Multiple Options</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <FiGlobe className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Pakistan Network</div>
                <div className="text-sm">All Major Cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-600 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Legal Links */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-gray-400 text-sm">
              <p>&copy; 2024 DukanBaz. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <span className="text-gray-600">•</span>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <span className="text-gray-600">•</span>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>

            {/* Language & Currency Switchers */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 text-gray-300">
                <FiGlobe className="w-4 h-4 text-indigo-400" />
                <select
                  aria-label="Language"
                  className="h-9 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="ur">Urdu</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="text-sm">Currency</span>
                <select
                  aria-label="Currency"
                  className="h-9 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue="PKR"
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                  <option value="AED">AED</option>
                </select>
              </div>

              <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm">
                <span>Made with</span>
                <FiHeart className="w-4 h-4 text-red-500" />
                <span>in Pakistan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
