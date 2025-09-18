"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiHome, 
  FiCheck, 
  FiShield, 
  FiArrowRight,
  FiUsers,
  FiGlobe,
  FiTrendingUp,
  FiStar,
  FiCheckCircle,
  FiX,
  FiLoader
} from "react-icons/fi";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "buyer", // Default to buyer
    agree: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (form.password.length >= 8) strength++;
    if (/[A-Z]/.test(form.password)) strength++;
    if (/[a-z]/.test(form.password)) strength++;
    if (/[0-9]/.test(form.password)) strength++;
    if (/[^A-Za-z0-9]/.test(form.password)) strength++;
    setPasswordStrength(strength);
  }, [form.password]);

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

    // Validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (!form.agree) {
      setError("You must agree to the Terms and Privacy Policy");
      setIsLoading(false);
      return;
    }
    if (passwordStrength < 3) {
      setError("Password is too weak. Please include uppercase, lowercase, and numbers.");
      setIsLoading(false);
      return;
    }

    try {
      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          password: form.password,
          company: form.company,
          role: form.role, // Use the selected role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess("Account created successfully! Redirecting to profile setup...");
      setIsLoading(false);
      
      // Redirect to appropriate setup page based on role
      setTimeout(() => {
        if (form.role === 'supplier') {
          router.push('/profile/supplier-setup');
        } else {
          router.push('/profile/buyer-setup');
        }
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      setIsLoading(false);
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return "Weak";
      case 2:
      case 3: return "Medium";
      case 4:
      case 5: return "Strong";
      default: return "";
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return "bg-red-500";
      case 2:
      case 3: return "bg-yellow-500";
      case 4:
      case 5: return "bg-green-500";
      default: return "bg-gray-300";
    }
  };

  const stats = [
    { icon: FiUsers, value: "10K+", label: "Active Buyers" },
    { icon: FiGlobe, value: "50+", label: "Countries" },
    { icon: FiTrendingUp, value: "99%", label: "Success Rate" },
    { icon: FiStar, value: "4.9", label: "Rating" }
  ];

  const benefits = [
    "Access to 10,000+ verified suppliers",
    "Real-time order tracking and analytics",
    "Secure payment processing",
    "24/7 customer support",
    "Mobile app for on-the-go management"
  ];

  return (
    <>
      <Head>
        <title>Create Account - WholesaleHub</title>
        <meta name="description" content="Join WholesaleHub and connect with verified suppliers worldwide. Start your wholesale journey today." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Side - Marketing Content */}
              <div className="hidden lg:flex flex-col justify-center space-y-8">
                <div className="animate-fade-in">
                  <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
                    Join the Future of 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Wholesale</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Connect with verified suppliers worldwide and scale your business with our comprehensive wholesale platform.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  {stats.map((stat, index) => (
                    <div key={index} className="card-glass p-4 text-center">
                      <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose WholesaleHub?</h3>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <FiCheck className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Registration Form */}
              <div className="flex flex-col justify-center">
                <div className="card-glass p-8 lg:p-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                    <p className="text-gray-600">Join thousands of successful businesses</p>
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
                    {/* Full Name */}
              <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FiUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                          focusedField === 'fullName' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => setFocusedField('')}
                          className="input-modern pl-12"
                          placeholder="Enter your full name (e.g., Ahmed Khan)"
                />
              </div>
                    </div>

                    {/* Company Name */}
              <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <div className="relative">
                        <FiHome className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                          focusedField === 'company' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={form.company}
                  onChange={handleChange}
                          onFocus={() => setFocusedField('company')}
                          onBlur={() => setFocusedField('')}
                          className="input-modern pl-12"
                          placeholder="Enter your company name (e.g., ABC Trading Co.)"
                />
              </div>
                    </div>

                    {/* Email and Phone in a row on larger screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
              <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                            focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField('')}
                            className="input-modern pl-12"
                            placeholder="Enter your email (e.g., ahmed@company.com)"
                />
              </div>
                      </div>

                      {/* Phone */}
              <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <FiPhone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                            focusedField === 'phone' ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField('')}
                            className="input-modern pl-12"
                            placeholder="Enter your phone number (+92 300 1234567)"
                />
              </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        I am a:
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            value="buyer"
                            checked={form.role === "buyer"}
                            onChange={handleChange}
                            className="form-radio text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Buyer</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="role"
                            value="supplier"
                            checked={form.role === "supplier"}
                            onChange={handleChange}
                            className="form-radio text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Supplier</span>
                        </label>
                      </div>
                    </div>

                    {/* Password */}
              <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                          focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                <input
                  id="password"
                  name="password"
                          type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField('')}
                          className="input-modern pl-12 pr-12"
                          placeholder="Create a strong password (minimum 8 characters)"
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
                      
                      {/* Password Strength Indicator */}
                      {form.password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
                            <span className="text-xs font-medium text-gray-600">
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
              <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                          focusedField === 'confirmPassword' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField('')}
                          className="input-modern pl-12 pr-12"
                          placeholder="Re-enter your password to confirm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <FiEyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <FiEye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      
                      {/* Password Match Indicator */}
                      {form.confirmPassword && (
                        <div className="mt-2 flex items-center gap-2">
                          {form.password === form.confirmPassword ? (
                            <>
                              <FiCheck className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <FiX className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-500">Passwords don&apos;t match</span>
                            </>
                          )}
                        </div>
                      )}
              </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start gap-3">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  checked={form.agree}
                  onChange={handleChange}
                        className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  required
                />
                      <label htmlFor="agree" className="text-sm text-gray-700 leading-relaxed">
                        I agree to the{' '}
                        <a href="/terms" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                          Terms of Service
                        </a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
                          Privacy Policy
                        </a>
                </label>
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
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
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

                  {/* Sign In Link */}
                  <div className="mt-8 text-center">
                    <span className="text-gray-600">Already have an account?{' '}</span>
                    <button 
                      onClick={() => router.push('/signin')}
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                    >
                      Sign In
              </button>
            </div>

                  {/* Security Badge */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <FiShield className="w-4 h-4" />
                    <span>Your data is protected with 256-bit SSL encryption</span>
                  </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 