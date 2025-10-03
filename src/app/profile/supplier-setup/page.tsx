"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import ImageUpload from "../../../components/ImageUpload";
import { 
  FiSave, 
  FiArrowLeft, 
  FiUser,
  FiMapPin,
  FiFileText,
  FiPackage,
  FiDollarSign,
  FiAlertCircle
} from "react-icons/fi";

export default function SupplierSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // API Functions
  const saveStepData = async (stepNumber: number, data: unknown) => {
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
          role: 'supplier'
        }),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, create a generic error
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        const errorMessage = (result && typeof result === 'object' && result.error) 
          ? result.error 
          : `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return result;
    } catch (error: unknown) {
      console.error('Save error:', error instanceof Error ? error.message : 'Unknown error');
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
    yearEstablished: "",
    employeeCount: "",
    
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
    certifications: [],
    
    // Product Categories
    productCategories: [],
    
    // Company Description
    description: "",
    
    // Payment & Shipping
    paymentTerms: "",
    shippingMethods: [],
    minimumOrder: "",
    
    // Profile Images
    profileImage: "",
    coverImage: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
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
    "Manufacturer", "Wholesaler", "Distributor", "Trading Company", "Factory", "Export Company"
  ];

  const employeeCounts = [
    "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
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

  const certifications = [
    "ISO 9001", "ISO 14001", "CE Marking", "PSQCA", "PCSIR",
    "Halal Certification", "Export License", "Trade License", "GST Registration", "Other"
  ];

  const paymentTermsOptions = [
    "Cash on Delivery", "Bank Transfer", "Letter of Credit", "T/T (Telegraphic Transfer)",
    "Western Union", "PayPal", "Advance Payment", "Net 30", "Net 60"
  ];

  const shippingMethodsOptions = [
    "Air Freight", "Sea Freight", "Land Transport", "Express Courier", "Local Delivery"
  ];

  const steps = [
    { id: 1, title: "Company Info", icon: <FiUser className="w-5 h-5" />, description: "Basic company details" },
    { id: 2, title: "Contact & Location", icon: <FiMapPin className="w-5 h-5" />, description: "Address and contact info" },
    { id: 3, title: "Business Details", icon: <FiFileText className="w-5 h-5" />, description: "Licenses and certifications" },
    { id: 4, title: "Products & Services", icon: <FiPackage className="w-5 h-5" />, description: "What you offer" },
    { id: 5, title: "Terms & Final", icon: <FiDollarSign className="w-5 h-5" />, description: "Payment and shipping" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleArrayChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...(prev[name as keyof typeof prev] as string[]), value]
        : (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  // Handle profile image upload
  const handleProfileImageUpload = (imageData: { url: string; publicId: string }) => {
    setProfileImageUrl(imageData.url);
    setFormData(prev => ({ ...prev, profileImage: imageData.url }));
  };

  // Handle cover image upload
  const handleCoverImageUpload = (imageData: { url: string; publicId: string }) => {
    setCoverImageUrl(imageData.url);
    setFormData(prev => ({ ...prev, coverImage: imageData.url }));
  };

  // Handle image removal
  const handleImageRemove = async (publicId: string) => {
    try {
      const response = await fetch(`/api/upload?publicId=${publicId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      throw error;
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        // Only company name is required, others are optional
        if (!formData.companyName) newErrors.companyName = "Company name is required";
        break;
      case 2:
        // Only basic contact info is required
        if (!formData.phone) newErrors.phone = "Phone number is required";
        // Address fields are optional
        break;
      case 3:
        // All business details are optional
        // Users can skip this step entirely
        break;
      case 4:
        // All product details are optional
        // Users can skip this step entirely
        break;
      case 5:
        // All payment terms are optional
        // Users can skip this step entirely
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
        case 3: // Product Information
          stepData = {
            productCategories: formData.productCategories,
            certifications: formData.certifications,
            minOrderQuantity: formData.moq,
            productionCapacity: formData.productionCapacity
          };
          break;
        case 4: // Additional Information
          stepData = {
            socialLinks: {
              linkedin: formData.linkedin,
              website: formData.website
            },
            profileImage: formData.profileImage,
            coverImage: formData.coverImage
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
      
      // Redirect to supplier dashboard
      router.push('/supplier-dashboard');
    } catch (error) {
      console.error('Error saving supplier setup:', error);
    }
  };



  return (
    <>
      <Head>
        <title>Supplier Setup - {formData.companyName || "New Supplier"}</title>
        <meta name="description" content="Complete your supplier profile to start selling on our platform" />
      </Head>
      
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className={`${isLoaded ? 'animate-fade-in' : 'opacity-0'} mb-8`}>
            <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4 group">
              <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Profile</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Profile Setup</h1>
            <p className="text-gray-600">Complete your supplier profile to start selling on our platform</p>
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
                      <p className="text-gray-600">Tell us about your business and company details</p>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                        Company Logo
                      </label>
                      <ImageUpload
                        type="avatar"
                        userId={session?.user?.email || ''}
                        onUpload={handleProfileImageUpload}
                        onRemove={handleImageRemove}
                        currentImage={profileImageUrl}
                        className="max-w-sm mx-auto"
                      />
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
                          placeholder="Enter your company name (e.g., Tech Solutions Ltd.)"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Year Established *</label>
                        <input
                          type="number"
                          name="yearEstablished"
                          value={formData.yearEstablished}
                          onChange={handleInputChange}
                          className="input-modern"
                          placeholder="e.g., 2010"
                          min="1900"
                          max={new Date().getFullYear()}
                          required
                        />
                        {errors.yearEstablished && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.yearEstablished}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Employees *</label>
                        <select
                          name="employeeCount"
                          value={formData.employeeCount}
                          onChange={handleInputChange}
                          className="input-modern"
                          required
                        >
                          <option value="">Select employee count</option>
                          {employeeCounts.map(count => (
                            <option key={count} value={count}>{count}</option>
                          ))}
                        </select>
                        {errors.employeeCount && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.employeeCount}
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
                            placeholder="Enter full name (e.g., Muhammad Ali, Ayesha Khan)"
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
                            placeholder="Enter business email (e.g., info@company.com.pk)"
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
                            placeholder="Enter phone number (+92 321 1234567)"
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
                            placeholder="Enter website URL (e.g., https://www.company.com.pk)"
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
                            placeholder="Enter city (e.g., Sialkot, Faisalabad, Gujranwala)"
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
                      <p className="text-gray-600">Provide your business licenses and certifications</p>
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
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Certifications & Standards</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {certifications.map(cert => (
                          <label key={cert} className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.certifications.includes(cert)}
                              onChange={(e) => handleArrayChange('certifications', cert, e.target.checked)}
                              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{cert}</span>
                          </label>
                        ))}
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
                        placeholder="Describe your company, products, and what makes you unique..."
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

                {/* Step 4: Products & Services */}
                {currentStep === 4 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiPackage className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Products & Services</h2>
                      <p className="text-gray-600">Tell us about the products and services you offer</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Product Categories *</label>
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

                    {/* Cover Image Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Company Cover Photo
                      </label>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload a cover photo that represents your business (optional)
                      </p>
                      <ImageUpload
                        type="cover"
                        userId={session?.user?.email || ''}
                        onUpload={handleCoverImageUpload}
                        onRemove={handleImageRemove}
                        currentImage={coverImageUrl}
                        className="w-full"
                      />
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment & Shipping Terms</h2>
                      <p className="text-gray-600">Set your payment terms and shipping preferences</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Terms *</label>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Minimum Order Value (PKR) *</label>
                        <input
                          type="number"
                          name="minimumOrder"
                          value={formData.minimumOrder}
                          onChange={handleInputChange}
                          className="input-modern"
                          placeholder="Enter minimum order value"
                          min="0"
                          required
                        />
                        {errors.minimumOrder && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            {errors.minimumOrder}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Shipping Methods</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {shippingMethodsOptions.map(method => (
                          <label key={method} className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.shippingMethods.includes(method)}
                              onChange={(e) => handleArrayChange('shippingMethods', method, e.target.checked)}
                              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Setup Completion Benefits */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-4">🎉 Profile Completion Benefits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Get verified supplier badge</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Access to buyer requests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Premium listing visibility</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="w-4 h-4 text-blue-600" />
                          <span>Direct buyer messaging</span>
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