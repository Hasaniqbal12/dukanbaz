"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '../../components/Header';
import ImageUpload from '../../components/ImageUpload';
import { 
  FiPlus, 
  FiMinus, 
  FiTag, 
  FiPackage, 
  FiDollarSign, 
  FiTruck, 
  FiEye, 
  FiCheck, 
  FiLock, 
  FiArrowLeft, 
  FiArrowRight, 
  FiSave, 
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';

interface PriceTier {
  minQty: number;
  maxQty?: number;
  price: number;
  label: string;
}

interface ProductOption {
  id: string;
  name: string;
  type: 'color' | 'size' | 'material' | 'style' | 'dropdown';
  values: Array<{
    id: string;
    name: string;
    value: string;
    color?: string;
    priceModifier?: number;
  }>;
  required: boolean;
}

interface VariationCombination {
  id: string;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  price: number;
  stock: number;
  sku: string;
}

interface Specification {
  name: string;
  value: string;
}

interface ProductFormData {
  title: string;
  description: string;
  longDescription: string;
  images: string[];
  price: number;
  originalPrice: number;
  category: string;
  subcategory: string;
  moq: string;
  available: number;
  unit: string;
  priceTiers: PriceTier[];
  specifications: Specification[];
  features: string[];
  tags: string[];
  options: ProductOption[];
  shippingInfo: {
    fastShipping: boolean;
    estimatedDays: string;
    shippingCost: string;
    dropshippingAvailable: boolean;
    dropshippingFee: number;
  };
  certifications: string[];
  status: 'active' | 'draft';
}

export default function AddProductPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; originalName?: string }>>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    longDescription: '',
    images: [],
    price: 0,
    originalPrice: 0,
    category: '',
    subcategory: '',
    moq: '',
    available: 0,
    unit: 'piece',
    priceTiers: [],
    specifications: [],
    features: [],
    tags: [],
    options: [],
    shippingInfo: {
      fastShipping: false,
      estimatedDays: '',
      shippingCost: '',
      dropshippingAvailable: false,
      dropshippingFee: 0
    },
    certifications: [],
    status: 'draft'
  });

  const [generatedCombinations, setGeneratedCombinations] = useState<VariationCombination[]>([]);

  const categories = [
    'Electronics', 'Apparel', 'Home & Garden', 'Sports & Outdoor',
    'Beauty & Personal Care', 'Automotive', 'Industrial Equipment',
    'Food & Beverages', 'Health & Medical', 'Office Supplies'
  ];

  const units = ['piece', 'kg', 'gram', 'meter', 'yard', 'liter', 'box', 'pack', 'dozen', 'set'];

  const steps = [
    { id: 1, title: 'Basic Info', icon: FiPackage, description: 'Product details and images' },
    { id: 2, title: 'Pricing', icon: FiDollarSign, description: 'Pricing and tiers' },
    { id: 3, title: 'Specifications', icon: FiTag, description: 'Features and specs' },
    { id: 4, title: 'Shipping', icon: FiTruck, description: 'Shipping and options' },
    { id: 5, title: 'Preview', icon: FiEye, description: 'Review and publish' }
  ];

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signin?callbackUrl=/add-product');
      return;
    }
    
    if (session.user?.role !== 'supplier') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Handle image upload from S3 component
  const handleImageUpload = (imageData: { url: string; originalName?: string }) => {
    setUploadedImages(prev => [...prev, imageData]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageData.url]
    }));
    // Clear any image errors
    setErrors(prev => ({ ...prev, images: '' }));
  };

  // Handle image removal
  const handleImageRemove = async (imageUrl: string) => {
    try {
      const response = await fetch(`/api/upload?imageUrl=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const imageToRemove = uploadedImages.find(img => img.url === imageUrl);
        if (imageToRemove) {
          setUploadedImages(prev => prev.filter(img => img.url !== imageUrl));
          setFormData(prev => ({
            ...prev,
            images: prev.images.filter(url => url !== imageToRemove.url)
          }));
        }
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      throw error;
    }
  };

  // Add price tier
  const addPriceTier = () => {
    setFormData({
      ...formData,
      priceTiers: [...formData.priceTiers, { minQty: 1, price: 0, label: 'Custom tier' }]
    });
  };

  // Remove price tier
  const removePriceTier = (index: number) => {
    setFormData({
      ...formData,
      priceTiers: formData.priceTiers.filter((_, i) => i !== index)
    });
  };

  // Add specification
  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { name: '', value: '' }]
    });
  };

  // Remove specification
  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index)
    });
  };

  // Add product option/variation
  const addOption = () => {
    const newOption: ProductOption = {
      id: Date.now().toString(),
      name: '',
      type: 'color',
      values: [],
      required: false
    };
    setFormData({
      ...formData,
      options: [...formData.options, newOption]
    });
  };

  // Remove product option
  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  // Update option
  const updateOption = (index: number, field: keyof ProductOption, value: string | boolean) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData({
      ...formData,
      options: updatedOptions
    });
  };

  // Add option value
  const addOptionValue = (optionIndex: number) => {
    const updatedOptions = [...formData.options];
    const newValue = {
      id: Date.now().toString(),
      name: '',
      value: '',
      priceModifier: 0
    };
    updatedOptions[optionIndex].values.push(newValue);
    setFormData({
      ...formData,
      options: updatedOptions
    });
  };

  // Remove option value
  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updatedOptions = [...formData.options];
    updatedOptions[optionIndex].values = updatedOptions[optionIndex].values.filter((_, i) => i !== valueIndex);
    setFormData({
      ...formData,
      options: updatedOptions
    });
  };

  // Update option value
  const updateOptionValue = (optionIndex: number, valueIndex: number, field: string, value: string | number) => {
    const updatedOptions = [...formData.options];
    updatedOptions[optionIndex].values[valueIndex] = {
      ...updatedOptions[optionIndex].values[valueIndex],
      [field]: value
    };
    setFormData({
      ...formData,
      options: updatedOptions
    });
    // Regenerate combinations when options change
    generateVariationCombinations(updatedOptions);
  };

  // Generate variation combinations
  const generateVariationCombinations = (options: ProductOption[]) => {
    if (!options || options.length === 0 || !formData.price) {
      setGeneratedCombinations([]);
      return;
    }

    // Filter options that have values
    const validOptions = options.filter(option => option.values.length > 0);
    if (validOptions.length === 0) {
      setGeneratedCombinations([]);
      return;
    }

    // Define types for option values
    type OptionValueItem = {
      optionName: string;
      valueName: string;
      valueId: string;
      priceModifier: number;
    };

    // Generate cartesian product
    const cartesianProduct = (arrays: OptionValueItem[][]): OptionValueItem[][] => {
      return arrays.reduce((acc, curr) => 
        acc.flatMap(x => curr.map(y => [...x, y]))
      , [[]] as OptionValueItem[][]);
    };

    const optionValues = validOptions.map(option => 
      option.values.map(value => ({
        optionName: option.name,
        valueName: value.name,
        valueId: value.value,
        priceModifier: value.priceModifier || 0
      }))
    );

    const allCombinations = cartesianProduct(optionValues);

    const combinations: VariationCombination[] = allCombinations.map((combination, index) => {
      const totalPriceModifier = combination.reduce((sum: number, item) => sum + item.priceModifier, 0);
      const finalPrice = formData.price + totalPriceModifier;

      return {
        id: `combo_${index}`,
        attributes: combination.map((item) => ({
          name: item.optionName,
          value: item.valueName
        })),
        price: finalPrice,
        stock: 1000, // Default stock
        sku: `SKU_${index + 1}`
      };
    });

    setGeneratedCombinations(combinations);
  };

  // Update combination stock
  const updateCombinationStock = (combinationId: string, stock: number) => {
    setGeneratedCombinations(prev => 
      prev.map(combo => 
        combo.id === combinationId 
          ? { ...combo, stock }
          : combo
      )
    );
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Product title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (uploadedImages.length === 0) newErrors.images = 'At least one image is required';
        break;
      
      case 2:
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
        if (!formData.moq) newErrors.moq = 'MOQ is required';
        if (formData.available < 0) newErrors.available = 'Available quantity cannot be negative';
        break;
      
      case 3:
        // Optional validations for specifications
        break;
      
      case 4:
        // Optional validations for variations
        break;
      
      case 5:
        if (!formData.shippingInfo.estimatedDays) newErrors.estimatedDays = 'Estimated delivery time is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next/previous step
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Use the uploaded Cloudinary image URLs
      const productData = {
        ...formData,
        images: formData.images, // Already contains Cloudinary URLs
        // Update price tiers with current base price and clean invalid maxQty values
        priceTiers: formData.priceTiers.map(tier => ({
          ...tier,
          price: tier.price || formData.price,
          maxQty: tier.maxQty && tier.maxQty > 0 ? tier.maxQty : undefined
        }))
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Product created successfully!');
        router.push(`/product/${result.data._id}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create product'}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!session || session.user?.role !== 'supplier') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header showMegaMenu={false} />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Modern Header */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4">
              <FiPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Add New Product
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create a compelling product listing that attracts buyers and drives sales
            </p>
          </div>
        </div>

        {/* Modern Progress Steps */}
        <div className="mb-12">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              />
            </div>
            
            {/* Steps */}
            <div className="relative flex items-center justify-between">
              {[
                { step: 1, title: 'Basic Information', subtitle: 'Product details & images', icon: FiPackage },
                { step: 2, title: 'Pricing & Stock', subtitle: 'Price tiers & inventory', icon: FiDollarSign },
                { step: 3, title: 'Specifications', subtitle: 'Features & details', icon: FiTag },
                { step: 4, title: 'Shipping Info', subtitle: 'Delivery & logistics', icon: FiTruck },
                { step: 5, title: 'Review & Publish', subtitle: 'Final check', icon: FiEye }
              ].map(({ step, title, subtitle, icon: Icon }) => (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div className={`group w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 transform hover:scale-110 ${
                    currentStep === step
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : currentStep > step
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                      : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-indigo-300'
                  }`}>
                    {currentStep > step ? (
                      <FiCheck className="w-6 h-6 animate-bounce" />
                    ) : (
                      <Icon className={`w-6 h-6 transition-transform group-hover:scale-110`} />
                    )}
                  </div>
                  <div className="text-center">
                    <span className={`block text-sm font-semibold mb-1 transition-colors ${
                      currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {title}
                    </span>
                    <span className={`block text-xs transition-colors ${
                      currentStep >= step ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modern Form Content */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4">
                  <FiPackage className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Basic Information</h2>
                <p className="text-gray-600">Add your product details and upload high-quality images</p>
              </div>
              
              {/* Product Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-100'
                  }`}
                  placeholder="Enter product title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-100'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subcategory"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-100'
                  }`}
                  placeholder="Brief description of your product..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description including features, benefits, use cases..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images *
                </label>
                
                <ImageUpload
                  type="product"
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  multiple={true}
                  maxFiles={10}
                  className="w-full"
                />

                {errors.images && (
                  <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing & Inventory</h2>
              
              {/* Basic Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (PKR) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-100'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MOQ and Available */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Quantity *
                  </label>
                  <input
                    type="text"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.moq ? 'border-red-500' : 'border-gray-100'
                    }`}
                    placeholder="e.g., 100 pcs"
                  />
                  {errors.moq && (
                    <p className="mt-1 text-sm text-red-600">{errors.moq}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: Number(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.available ? 'border-red-500' : 'border-gray-100'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.available && (
                    <p className="mt-1 text-sm text-red-600">{errors.available}</p>
                  )}
                </div>
              </div>

              {/* Price Tiers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity-Based Pricing Tiers
                  </label>
                  <button
                    onClick={addPriceTier}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.priceTiers.map((tier, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-100 rounded-lg">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Min Qty</label>
                        <input
                          type="number"
                          value={tier.minQty}
                          onChange={(e) => {
                            const newTiers = [...formData.priceTiers];
                            newTiers[index].minQty = Number(e.target.value);
                            setFormData({ ...formData, priceTiers: newTiers });
                          }}
                          className="w-full px-3 py-2 border border-gray-100 rounded text-sm"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Max Qty</label>
                        <input
                          type="number"
                          value={tier.maxQty || ''}
                          onChange={(e) => {
                            const newTiers = [...formData.priceTiers];
                            const value = e.target.value;
                            if (value === '' || value === '0') {
                              newTiers[index].maxQty = undefined;
                            } else {
                              const numValue = Number(value);
                              newTiers[index].maxQty = numValue > 0 ? numValue : undefined;
                            }
                            setFormData({ ...formData, priceTiers: newTiers });
                          }}
                          className="w-full px-3 py-2 border border-gray-100 rounded text-sm"
                          placeholder="Optional"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Price (PKR)</label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => {
                            const newTiers = [...formData.priceTiers];
                            newTiers[index].price = Number(e.target.value);
                            setFormData({ ...formData, priceTiers: newTiers });
                          }}
                          className="w-full px-3 py-2 border border-gray-100 rounded text-sm"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Label</label>
                        <input
                          type="text"
                          value={tier.label}
                          onChange={(e) => {
                            const newTiers = [...formData.priceTiers];
                            newTiers[index].label = e.target.value;
                            setFormData({ ...formData, priceTiers: newTiers });
                          }}
                          className="w-full px-3 py-2 border border-gray-100 rounded text-sm"
                          placeholder="e.g., 1-99 pcs"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => removePriceTier(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                          disabled={formData.priceTiers.length <= 1}
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Specifications */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications & Features</h2>
              
              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Specifications
                  </label>
                  <button
                    onClick={addSpecification}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Specification
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-100 rounded-lg">
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => {
                          const newSpecs = [...formData.specifications];
                          newSpecs[index].name = e.target.value;
                          setFormData({ ...formData, specifications: newSpecs });
                        }}
                        className="px-3 py-2 border border-gray-100 rounded"
                        placeholder="Specification name (e.g., Material)"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...formData.specifications];
                            newSpecs[index].value = e.target.value;
                            setFormData({ ...formData, specifications: newSpecs });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-100 rounded"
                          placeholder="Value (e.g., Cotton)"
                        />
                        <button
                          onClick={() => removeSpecification(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {formData.specifications.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No specifications added yet</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features (one per line)
                </label>
                <textarea
                  value={formData.features.join('\n')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    features: e.target.value.split('\n').filter(f => f.trim()) 
                  })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="High-quality materials&#10;Durable construction&#10;Easy to use&#10;Eco-friendly"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="wholesale, bulk, quality, affordable"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.certifications.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    certifications: e.target.value.split(',').map(c => c.trim()).filter(c => c) 
                  })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ISO 9001, CE, FDA, GOTS"
                />
              </div>
            </div>
          )}

          {/* Step 4: Product Variations */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Variations</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Add variations like colors, sizes, materials, or styles. Each variation can have different pricing.
                </p>
              </div>

              {/* Options/Variations */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Product Options</h3>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    Add Option
                  </button>
                </div>

                {formData.options.map((option, optionIndex) => (
                  <div key={option.id} className="border border-gray-100 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Option Name
                          </label>
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => updateOption(optionIndex, 'name', e.target.value)}
                            placeholder="e.g., Color, Size, Material"
                            className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Option Type
                          </label>
                          <select
                            value={option.type}
                            onChange={(e) => updateOption(optionIndex, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="color">Color</option>
                            <option value="size">Size</option>
                            <option value="material">Material</option>
                            <option value="style">Style</option>
                            <option value="dropdown">Dropdown</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={option.required}
                              onChange={(e) => updateOption(optionIndex, 'required', e.target.checked)}
                              className="mr-2 rounded border-gray-100 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Required</span>
                          </label>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeOption(optionIndex)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiMinus />
                      </button>
                    </div>

                    {/* Option Values */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700">Option Values</h4>
                        <button
                          type="button"
                          onClick={() => addOptionValue(optionIndex)}
                          className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                        >
                          <FiPlus className="mr-1 w-3 h-3" />
                          Add Value
                        </button>
                      </div>

                      {option.values.map((value, valueIndex) => (
                        <div key={value.id} className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={value.name}
                            onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'name', e.target.value)}
                            placeholder="Display name (e.g., Red, Large)"
                            className="flex-1 px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="text"
                            value={value.value}
                            onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'value', e.target.value)}
                            placeholder="Value (e.g., red, lg)"
                            className="flex-1 px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                          {option.type === 'color' && (
                            <input
                              type="color"
                              value={value.color || '#000000'}
                              onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'color', e.target.value)}
                              className="w-10 h-8 border border-gray-100 rounded cursor-pointer"
                            />
                          )}
                          <input
                            type="number"
                            value={value.priceModifier || 0}
                            onChange={(e) => updateOptionValue(optionIndex, valueIndex, 'priceModifier', parseFloat(e.target.value) || 0)}
                            placeholder="Price modifier"
                            className="w-24 px-2 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            step="0.01"
                          />
                          <button
                            type="button"
                            onClick={() => removeOptionValue(optionIndex, valueIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {option.values.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No values added yet. Click &quot;Add Value&quot; to start.</p>
                      )}
                    </div>
                  </div>
                ))}

                {formData.options.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <FiTag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No product variations added yet</p>
                    <button
                      type="button"
                      onClick={addOption}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FiPlus className="mr-2" />
                      Add First Option
                    </button>
                  </div>
                )}
              </div>

              {/* Generated Combinations Preview */}
              {generatedCombinations.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Generated Combinations ({generatedCombinations.length})
                    </h3>
                    <div className="text-sm text-gray-500">
                      Auto-generated from your variations
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="grid gap-3">
                      {generatedCombinations.map((combination) => (
                        <div key={combination.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {combination.attributes.map((attr, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                                    {attr.name}: {attr.value}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="font-medium text-green-600">
                                  PKR {combination.price.toLocaleString()}
                                </span>
                                <span>SKU: {combination.sku}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Stock:</label>
                                <input
                                  type="number"
                                  value={combination.stock}
                                  onChange={(e) => updateCombinationStock(combination.id, parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> These combinations will be automatically created when you publish the product. 
                      You can adjust stock levels for each combination above.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Shipping */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping & Options</h2>
              
              {/* Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Time *
                  </label>
                  <input
                    type="text"
                    value={formData.shippingInfo.estimatedDays}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      shippingInfo: { ...formData.shippingInfo, estimatedDays: e.target.value }
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.estimatedDays ? 'border-red-500' : 'border-gray-100'
                    }`}
                    placeholder="5-7 business days"
                  />
                  {errors.estimatedDays && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimatedDays}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost
                  </label>
                  <input
                    type="text"
                    value={formData.shippingInfo.shippingCost}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      shippingInfo: { ...formData.shippingInfo, shippingCost: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Calculated at checkout"
                  />
                </div>
              </div>

              {/* Fast Shipping */}
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.shippingInfo.fastShipping}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      shippingInfo: { ...formData.shippingInfo, fastShipping: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-100 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Offer fast shipping</span>
                </label>
              </div>

              {/* Dropshipping Option */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.shippingInfo.dropshippingAvailable}
                    onChange={(e) => {
                      if (e.target.checked && session?.user?.membership?.tier === 'basic') {
                        alert('Premium membership required for dropshipping. Please upgrade your membership to offer dropshipping services.');
                        return;
                      }
                      setFormData({ 
                        ...formData, 
                        shippingInfo: { ...formData.shippingInfo, dropshippingAvailable: e.target.checked }
                      });
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-100 rounded focus:ring-blue-500 mt-0.5"
                    disabled={session?.user?.membership?.tier === 'basic'}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Enable Dropshipping</span>
                      {session?.user?.membership?.tier === 'basic' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                          <FiLock className="w-3 h-3" />
                          Premium Required
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Allow buyers to have this product shipped directly to their customers
                    </p>
                    
                    {formData.shippingInfo.dropshippingAvailable && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dropshipping Fee (PKR)
                        </label>
                        <input
                          type="number"
                          value={formData.shippingInfo.dropshippingFee}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            shippingInfo: { ...formData.shippingInfo, dropshippingFee: parseFloat(e.target.value) || 0 }
                          })}
                          className="w-full px-3 py-2 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Additional fee for dropshipping (optional)"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'draft' })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active (Publish immediately)</option>
                  <option value="draft">Draft (Save for later)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 6: Preview */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview & Publish</h2>
              
              {/* Product Preview */}
              <div className="border border-gray-100 rounded-lg p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Images */}
                  <div>
                    {uploadedImages.length > 0 && (
                      <div className="space-y-4">
                        <img
                          src={uploadedImages[0].url}
                          alt="Main product"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        {uploadedImages.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {uploadedImages.slice(1, 5).map((img, index) => (
                              <img
                                key={index}
                                src={img.url}
                                alt={`Product ${index + 2}`}
                                className="w-full h-16 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h3>
                    <p className="text-gray-600 mb-4">{formData.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{formData.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-lg">PKR {formData.price.toLocaleString()}/{formData.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">MOQ:</span>
                        <span className="font-medium">{formData.moq}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium">{formData.available} {formData.unit}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Ready to publish?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Product information completed</li>
                  <li>✓ {uploadedImages.length} image(s) uploaded</li>
                  <li>✓ Pricing and tiers configured</li>
                  <li>✓ {formData.specifications.length} specification(s) added</li>
                  <li>✓ {formData.options.length} variation(s) configured</li>
                  <li>✓ Shipping information provided</li>
                </ul>
              </div>
            </div>
          )}

          {/* Modern Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:border-indigo-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 hover:text-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-semibold">Previous Step</span>
              </button>
            )}
            
            <div className={`${currentStep === 1 ? 'ml-auto' : ''}`}>
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-indigo-500/25"
                >
                  <span className="font-semibold">Continue</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-green-500/25"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span className="font-semibold">Publishing...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-5 h-5" />
                      <span className="font-semibold">Publish Product</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}