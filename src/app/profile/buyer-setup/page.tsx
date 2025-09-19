"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import ImageUpload from "../../../components/ImageUpload";
import { 
  FiUpload, 
  FiSave, 
  FiArrowLeft, 
  FiUser,
  FiMapPin,
  FiFileText,
  FiShoppingBag,
  FiDollarSign,
  FiAlertCircle
} from "react-icons/fi";

export default function BuyerSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // API Functions
  const saveStepData = async (stepNumber: number, data: any) => {
    try {
      setSaving(true);
      setErrors({});
      
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: stepNumber,
          data: data,
          role: 'buyer'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save data');
      }

      return result;
    } catch (error) {
      console.error('Save error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to save data' });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const [formData, setFormData] = useState({
    // Basic Info
    companyName: "",
    businessType: "",
    industry: "",
    companySize: "",
    
    // Contact Info
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    
    // Address
    country: "Pakistan",
    state: "",
    city: "",
    address: "",
    zipCode: "",
    
    // Business Details
    businessLicense: "",
    taxId: "",
    annualRevenue: "",
    
    // Purchasing Preferences
    productCategories: [],
    preferredSuppliers: [],
    budgetRange: "",
    orderFrequency: "",
    
    // Company Description
    description: "",
    
    // Payment Preferences
    paymentTerms: "",
    creditLimit: "",
    
    // Profile Image
    profileImage: null as File | null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const totalSteps = 5;

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const businessTypes = [
    "Retailer", "Wholesaler", "Distributor", "E-commerce", "Restaurant/Food Service", "Manufacturing"
  ];

  const industries = [
    "Electronics", "Fashion & Apparel", "Food & Beverage", "Healthcare", "Automotive",
    "Home & Garden", "Sports & Recreation", "Beauty & Personal Care", "Other"
  ];

  const companySizes = [
    "1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "500+ employees"
  ];

  const pakistaniStates = [
    "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "Azad Kashmir"
  ];

  const productCategories = [
    "Electronics", "Apparel", "Textiles", "Automotive", "Sports & Outdoors",
    "Beauty & Personal Care", "Toys & Games", "Food & Beverage", "Health & Medical",
    "Industrial & Scientific", "Jewelry & Watches", "Agriculture", "Furniture",
    "Tools & Hardware", "Machinery", "Chemicals", "Paper & Packaging", "Other"
  ];

  const budgetRanges = [
    "PKR 50,000 - 100,000", "PKR 100,000 - 500,000", "PKR 500,000 - 1,000,000",
    "PKR 1,000,000 - 5,000,000", "PKR 5,000,000 - 10,000,000", "PKR 10,000,000+"
  ];

  const orderFrequencies = [
    "Weekly", "Monthly", "Quarterly", "As needed", "Seasonal"
  ];

  const paymentTermsOptions = [
    "Cash on Delivery", "Bank Transfer", "Letter of Credit", "Credit Card",
    "Net 30", "Net 60", "Advance Payment"
  ];

  const steps = [
    { id: 1, title: "Company Info", icon: <FiUser className="w-5 h-5" />, description: "Basic company details" },
    { id: 2, title: "Contact & Location", icon: <FiMapPin className="w-5 h-5" />, description: "Address and contact info" },
    { id: 3, title: "Business Details", icon: <FiFileText className="w-5 h-5" />, description: "Business information" },
    { id: 4, title: "Purchasing Needs", icon: <FiShoppingBag className="w-5 h-5" />, description: "What you want to buy" },
    { id: 5, title: "Terms & Final", icon: <FiDollarSign className="w-5 h-5" />, description: "Payment preferences" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleArrayChange = (name: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...(prev[name] as string[]), value]
        : (prev[name] as string[]).filter(item => item !== value)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.companyName) newErrors.companyName = "Company name is required";
        if (!formData.businessType) newErrors.businessType = "Business type is required";
        if (!formData.industry) newErrors.industry = "Industry is required";
        if (!formData.companySize) newErrors.companySize = "Company size is required";
        break;
      case 2:
        if (!formData.contactPerson) newErrors.contactPerson = "Contact person is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone number is required";
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.city) newErrors.city = "City is required";
        break;
      case 3:
        if (!formData.businessLicense) newErrors.businessLicense = "Business license is required";
        if (!formData.description) newErrors.description = "Company description is required";
        break;
      case 4:
        if (formData.productCategories.length === 0) newErrors.productCategories = "Select at least one product category";
        if (!formData.budgetRange) newErrors.budgetRange = "Budget range is required";
        break;
      case 5:
        if (!formData.paymentTerms) newErrors.paymentTerms = "Payment terms are required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Prepare data based on current step
      let stepData: any = {};
      
      switch (currentStep) {
        case 1: // Contact & Location
          stepData = {
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          };
          break;
        case 2: // Business Information
          stepData = {
            businessName: formData.companyName,
            businessType: formData.businessType,
            description: formData.description,
            companySize: formData.companySize,
            foundedYear: formData.foundedYear,
            website: formData.website
          };
          break;
        case 3: // Purchase Information
          stepData = {
            productCategories: formData.interestedCategories,
            purchaseVolume: formData.purchaseVolume,
            preferredPaymentMethods: formData.paymentMethods,
            annualRevenue: formData.annualBudget
          };
          break;
        case 4: // Additional Information
          stepData = {
            socialLinks: {
              linkedin: formData.linkedin,
              website: formData.website
            },
            profileImage: formData.profileImage
          };
          break;
      }

      // Save step data to backend
      await saveStepData(currentStep, stepData);
      
      // Move to next step
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } catch (error) {
      console.error('Failed to save step data:', error);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      // Save final step data
      await saveStepData(5, { isProfileComplete: true });
      
      // Redirect to profile page
      router.push('/profile');
    } catch (error) {
      console.error('Failed to complete setup:', error);
    }
  };



  // Update handleSubmit for final step
  const handleFinalSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Complete profile setup
      await saveStepData(5, { isProfileComplete: true });
      
      // Redirect to profile page
      router.push('/profile');
    } catch (error) {
      console.error('Failed to complete setup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Legacy compatibility check
  const legacySubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Call API to save buyer setup data
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileData: formData
        }),
      });

      if (response.ok) {
        // Redirect to profile page
        router.push('/profile');
      } else {
        console.error('Failed to save buyer setup');
      }
    } catch (error) {
      console.error('Error saving buyer setup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Buyer Profile Setup - {session?.user?.name || ''}</title>
        <meta name="description" content="Complete your buyer profile to start sourcing products on our platform." />
      </Head>
      
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className={`${isLoaded ? 'animate-fade-in' : 'opacity-0'} mb-8`}>
            <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4 group">
              <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Profile</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Profile Setup</h1>
            <p className="text-gray-600">Complete your buyer profile to start sourcing products</p>
          </div>

          {/* Progress Steps */}
          <div className={`${isLoaded ? 'animate-fade-in delay-200' : 'opacity-0'} mb-8`}>
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      currentStep >= step.id 
                        ? 'gradient-primary text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step.id ? <FiAlertCircle className="w-6 h-6" /> : step.icon}
                    </div>
                    <div className="ml-4 hidden md:block">
                      <h3 className={`text-sm font-bold transition-colors ${
                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                      }`}>{step.title}</h3>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-1 rounded-full transition-all duration-300 ${
                        currentStep > step.id ? 'gradient-primary' : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className={`${isLoaded ? 'animate-fade-in delay-300' : 'opacity-0'}`}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                {/* Step 1: Company Info */}
                {currentStep === 1 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiUser className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
                      <p className="text-gray-600">Tell us about your business and purchasing needs</p>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-lg overflow-hidden">
                          {imagePreview ? (
                            <Image 
                              src={imagePreview} 
                              alt="Company Logo" 
                              width={128} 
                              height={128} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiShoppingBag className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-2 right-2 bg-white border-2 border-blue-500 rounded-full p-3 shadow-lg hover:bg-blue-50 transition cursor-pointer group">
                          <FiUpload className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Company Name *</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="input-modern"
                          placeholder="Enter your company name (e.g., ABC Trading Co.)"
                          required
                        />
                        {errors.companyName && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Business Type *</label>
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          className="input-modern"
                          required
                        >
                          <option value="">Select business type</option>
                          {businessTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {errors.businessType && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.businessType}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Industry *</label>
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className="input-modern"
                          required
                        >
                          <option value="">Select industry</option>
                          {industries.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                          ))}
                        </select>
                        {errors.industry && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.industry}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Company Size *</label>
                        <select
                          name="companySize"
                          value={formData.companySize}
                          onChange={handleInputChange}
                          className="input-modern"
                          required
                        >
                          <option value="">Select company size</option>
                          {companySizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        {errors.companySize && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.companySize}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact & Location */}
                {currentStep === 2 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMapPin className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact & Location</h2>
                      <p className="text-gray-600">Provide your contact information and business address</p>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Contact Person *</label>
                          <input
                            type="text"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            className="input-modern"
                            placeholder="Enter full name (e.g., Ahmed Khan, Fatima Ali)"
                            required
                          />
                          {errors.contactPerson && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.contactPerson}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="input-modern"
                            placeholder="Enter business email (e.g., procurement@company.com)"
                            required
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="input-modern"
                            placeholder="Enter phone number (+92 300 1234567)"
                            required
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Website</label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="input-modern"
                            placeholder="Enter company website (e.g., https://www.company.com.pk)"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Business Address */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Country *</label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="input-modern bg-gray-50"
                            placeholder="Pakistan"
                            disabled
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">State/Province *</label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="input-modern"
                            required
                          >
                            <option value="">Select state</option>
                            {pakistaniStates.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          {errors.state && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.state}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="input-modern"
                            placeholder="Enter city (e.g., Karachi, Lahore, Islamabad)"
                            required
                          />
                          {errors.city && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                              <FiAlertCircle className="w-4 h-4" />
                              {errors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">ZIP/Postal Code</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="input-modern"
                            placeholder="Enter ZIP or postal code"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Street Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="input-modern"
                          placeholder="Enter complete street address"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Business Details */}
                {currentStep === 3 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiFileText className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h2>
                      <p className="text-gray-600">Provide your business information and requirements</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Business License Number *</label>
                        <input
                          type="text"
                          name="businessLicense"
                          value={formData.businessLicense}
                          onChange={handleInputChange}
                          className="input-modern"
                          placeholder="Enter business license number"
                          required
                        />
                        {errors.businessLicense && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.businessLicense}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Tax ID Number</label>
                        <input
                          type="text"
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleInputChange}
                          className="input-modern"
                          placeholder="Enter tax identification number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Annual Revenue</label>
                        <input
                          type="text"
                          name="annualRevenue"
                          value={formData.annualRevenue}
                          onChange={handleInputChange}
                          className="input-modern"
                          placeholder="Enter annual revenue (PKR)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Credit Limit</label>
                        <input
                          type="number"
                          name="creditLimit"
                          value={formData.creditLimit}
                          onChange={handleInputChange}
                          className="input-modern"
                          placeholder="Enter desired credit limit (PKR)"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Company Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="input-modern"
                        rows={4}
                        placeholder="Describe your company, business needs, and what you're looking for..."
                        required
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <FiAlertCircle className="w-4 h-4" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Purchasing Needs */}
                {currentStep === 4 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiShoppingBag className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchasing Needs</h2>
                      <p className="text-gray-600">Tell us about your purchasing requirements and preferences</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Budget Range per Order *</label>
                        <select
                          name="budgetRange"
                          value={formData.budgetRange}
                          onChange={handleInputChange}
                          className="input-modern"
                          required
                        >
                          <option value="">Select budget range</option>
                          {budgetRanges.map(range => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </select>
                        {errors.budgetRange && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.budgetRange}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Order Frequency</label>
                        <select
                          name="orderFrequency"
                          value={formData.orderFrequency}
                          onChange={handleInputChange}
                          className="input-modern"
                        >
                          <option value="">Select order frequency</option>
                          {orderFrequencies.map(freq => (
                            <option key={freq} value={freq}>{freq}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Product Categories of Interest *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {productCategories.map(category => (
                          <label key={category} className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.productCategories.includes(category)}
                              onChange={(e) => handleArrayChange('productCategories', category, e.target.checked)}
                              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{category}</span>
                          </label>
                        ))}
                      </div>
                      {errors.productCategories && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <FiAlertCircle className="w-4 h-4" />
                          {errors.productCategories}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Terms & Final */}
                {currentStep === 5 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiDollarSign className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Preferences</h2>
                      <p className="text-gray-600">Set your preferred payment terms and complete your profile</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Payment Terms *</label>
                        <select
                          name="paymentTerms"
                          value={formData.paymentTerms}
                          onChange={handleInputChange}
                          className="input-modern"
                          required
                        >
                          <option value="">Select payment terms</option>
                          {paymentTermsOptions.map(term => (
                            <option key={term} value={term}>{term}</option>
                          ))}
                        </select>
                        {errors.paymentTerms && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.paymentTerms}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Suppliers</label>
                        <input
                          type="text"
                          name="preferredSuppliers"
                          value={Array.isArray(formData.preferredSuppliers) ? formData.preferredSuppliers.join(', ') : formData.preferredSuppliers}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              preferredSuppliers: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                            }));
                          }}
                          className="input-modern"
                          placeholder="Enter preferred supplier names (comma separated)"
                        />
                      </div>
                    </div>

                    {/* Setup Completion Benefits */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">🎉 Profile Completion Benefits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Get matched with verified suppliers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Receive personalized product recommendations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Access to exclusive deals and discounts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Priority customer support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    Step {currentStep} of {totalSteps}
                  </div>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next Step
                      <FiArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2 min-w-[140px]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          Complete Setup
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 