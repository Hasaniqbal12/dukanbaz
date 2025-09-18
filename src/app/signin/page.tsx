"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiShield, 
  FiArrowRight,
  FiUsers,
  FiGlobe,
  FiTrendingUp,
  FiStar,
  FiCheckCircle,
  FiX,
  FiLoader,
  FiAward,
  FiBox,
  FiTruck
} from "react-icons/fi";

export const metadata = {
  title: "Sign In - DukanBaz",
  description: "Sign in to your DukanBaz account and access thousands of wholesale products from verified suppliers in Pakistan.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/');
    }
  }, [session, status, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
    if (success) setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      } else {
        setSuccess("Sign in successful! Redirecting...");
        setIsLoading(false);
        
        // Redirect after success
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch {
      setError("An error occurred during sign in. Please try again.");
      setIsLoading(false);
    }
  }

  const stats = [
    { icon: FiUsers, value: "10K+", label: "Active Users", color: "text-blue-600" },
    { icon: FiGlobe, value: "50+", label: "Countries", color: "text-green-600" },
    { icon: FiTrendingUp, value: "99%", label: "Uptime", color: "text-purple-600" },
    { icon: FiStar, value: "4.9", label: "Rating", color: "text-yellow-600" }
  ];

  const features = [
    { icon: FiAward, title: "Verified Suppliers", desc: "Only work with trusted partners" },
    { icon: FiBox, title: "Quality Products", desc: "Premium wholesale inventory" },
    { icon: FiShield, title: "Secure Payments", desc: "Your transactions are protected" },
    { icon: FiTruck, title: "Fast Shipping", desc: "Quick delivery worldwide" }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Side - Marketing Content */}
              <div className="hidden lg:flex flex-col justify-center space-y-8">
                <div className="animate-fade-in">
                  <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
                    Welcome Back to 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600"> DukanBaz</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Continue your wholesale journey with access to thousands of verified suppliers and premium products in Pakistan.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  {stats.map((stat, index) => (
                    <div key={index} className="card-glass p-4 text-center">
                      <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Why Thousands Trust DukanBaz</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <feature.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Sign In Form */}
              <div className="flex flex-col justify-center">
                <div className="card-glass p-8 lg:p-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In to Your Account</h2>
                    <p className="text-gray-600">Welcome back! Please enter your details</p>
                  </div>

                  {/* Success/Error Messages */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                      <FiX className="w-5 h-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                      <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email or Phone */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email or Phone *
                      </label>
                      <div className="relative">
                        <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                          focusedField === 'email' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <input
                          id="email"
                          name="email"
                          type="text"
                          autoComplete="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          className="input-modern pl-12"
                          placeholder="Enter your email (e.g., ahmed@company.com) or phone (+92 300 1234567)"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                          focusedField === 'password' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={form.password}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField('')}
                          className="input-modern pl-12 pr-12"
                          placeholder="Enter your password (minimum 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {showPassword ? (
                            <FiEyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <FiEye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="remember"
                          checked={form.remember}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700 font-medium">Remember me</span>
                      </label>
                      <button 
                        type="button"
                        onClick={() => router.push('/forgot-password')}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold hover:underline transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <FiLoader className="w-5 h-5 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <FiArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center my-8">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="mx-4 text-gray-500 text-sm font-medium">or continue with</span>
                    <div className="flex-grow border-t border-gray-200" />
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button className="btn-social group">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Google</span>
                    </button>
                    
                    <button className="btn-social group">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
                    </button>
                  </div>

                  {/* Create Account Link */}
                  <div className="mt-8 text-center">
                    <span className="text-gray-600">Don&apos;t have an account?{' '}</span>
                    <button 
                      onClick={() => router.push('/register')}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline transition-colors"
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <FiShield className="w-4 h-4" />
                    <span>Your data is protected with 256-bit SSL encryption</span>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="lg:hidden mt-8 grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="card-glass p-4 text-center">
                      <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>      
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}