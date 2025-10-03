"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCart } from '../../../contexts/CartContext';
import { useToast } from '../../../components/Toast';
import PageLayout from '../../../components/PageLayout';
import DropshippingOption from '../../../components/product/DropshippingOption';

import { 
  FiHeart, 
  FiShoppingCart, 
  FiMessageCircle, 
  FiTruck, 
  FiShield, 
  FiRefreshCw, 
  FiChevronRight, 
  FiChevronLeft,
  FiAlertCircle,
  FiZoomIn,
  FiShare2,
  FiMaximize2,
  FiX,
  FiMinus,
  FiPlus
} from 'react-icons/fi';

interface ProductOption {
  id: string;
  name: string;
  type: 'color' | 'size' | 'material' | 'style' | 'dropdown';
  values: Array<{
    id: string;
    name: string;
    value: string;
    color?: string;
    priceModifier: number;
  }>;
  required: boolean;
}

interface PriceTier {
  minQty: number;
  maxQty: number | null;
  price: number;
}

interface VariationAttribute {
  name: string;
  values: Array<{
    name: string;
    hexCode?: string;
    image?: string;
  }>;
}

interface VariationCombination {
  id: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
  images?: string[];
}

interface CustomerAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  comparePrice?: number;
  category: string;
  subcategory?: string;
  moq: number;
  stock: number;
  unit: string;
  supplier: {
    _id: string;
    name: string;
    companyName?: string;
    location?: string;
    verified?: boolean;
  };
  rating?: number;
  options?: ProductOption[];
  reviewCount?: number;
  views?: number;
  tags?: string[];
  specifications?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  warranty?: string;
  returnPolicy?: string;
  priceTiers?: PriceTier[];
  variations?: {
    attributes: VariationAttribute[];
    combinations: VariationCombination[];
    defaultCombination: VariationCombination | null;
  };
  shipping?: {
    weight: number;
    freeShipping: boolean;
    shippingCost: number;
    estimatedDelivery: string;
    dropshippingAvailable?: boolean;
    dropshippingFee?: number;
  };
}



export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { showToast, ToastContainer } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCustomOrderPanel, setShowCustomOrderPanel] = useState(false);
  
  // Dropshipping state
  const [isDropshipping, setIsDropshipping] = useState(false);
  const [customerAddress, setCustomerAddress] = useState<CustomerAddress | null>(null);
  const [dropshippingInstructions, setDropshippingInstructions] = useState('');
  
  // Selected variation state
  const [selectedCombination, setSelectedCombination] = useState<VariationCombination | null>(null);
  
  // Variation-related state
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  
  const [customOrder, setCustomOrder] = useState({
    quantity: 1,
    unit: 'pieces',
    color: '',
    size: '',
    material: '',
    customizations: '',
    deliveryDate: '',
    notes: '',
    urgency: 'normal'
  });

  // Alibaba-style pricing tiers
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [showVariationModal, setShowVariationModal] = useState(false);
  
  // Modal state for variations and quantities with proper typing
  const [modalState, setModalState] = useState<{
    selectedTier: number;
    variationQuantities: Record<string, number>; // key: "colorName-sizeName" or just "colorName" or "sizeName"
    totalQuantity: number;
    subtotal: number;
  }>({
    selectedTier: 0,
    variationQuantities: {},
    totalQuantity: 0,
    subtotal: 0
  });

  // Get pricing tiers from product data or use defaults - memoized to prevent re-renders
  const pricingTiers = useMemo(() => {
    return product?.priceTiers || [
      { minQty: 10, maxQty: 49, price: product?.price ? product.price * 1.1 : 519.63 },
      { minQty: 50, maxQty: 199, price: product?.price ? product.price : 500.62 },
      { minQty: 200, maxQty: null, price: product?.price ? product.price * 0.95 : 481.61 }
    ];
  }, [product?.priceTiers, product?.price]);

  // Auto-select price tier based on total quantity
  useEffect(() => {
    const totalQty = modalState.totalQuantity;
    let newTier = 0;
    
    for (let i = 0; i < pricingTiers.length; i++) {
      if (totalQty >= pricingTiers[i].minQty) {
        if (!pricingTiers[i].maxQty || totalQty <= (pricingTiers[i].maxQty || 0)) {
          newTier = i;
        } else if (i === pricingTiers.length - 1) {
          newTier = i; // Last tier with no max limit
        }
      }
    }
    
    if (newTier !== modalState.selectedTier) {
      setModalState(prev => ({ ...prev, selectedTier: newTier }));
    }
  }, [modalState.totalQuantity, modalState.selectedTier, pricingTiers]);

  // Get all variations from product data - support all types
  const allVariations = useMemo(() => {
    return product?.variations?.attributes || [];
  }, [product?.variations?.attributes]);

  const colorOptions = useMemo(() => {
    const colorAttr = allVariations.find(attr => attr.name.toLowerCase() === 'color');
    return colorAttr?.values || [];
  }, [allVariations]);

  const sizeOptions = useMemo(() => {
    const sizeAttr = allVariations.find(attr => attr.name.toLowerCase() === 'size');
    return sizeAttr?.values || [];
  }, [allVariations]);

  const otherVariations = useMemo(() => {
    return allVariations.filter(attr => 
      !['color', 'size'].includes(attr.name.toLowerCase())
    );
  }, [allVariations]);

  // Check if product has any variations
  const hasVariations = allVariations.length > 0;

  // Initialize modal state with real product variations
  useEffect(() => {
    if (product && (colorOptions.length > 0 || sizeOptions.length > 0)) {
      const initialColorQuantities: Record<string, number> = {};
      const initialSizeQuantities: Record<string, number> = {};
      
      // Initialize color quantities with actual color options
      colorOptions.forEach(color => {
        initialColorQuantities[color.name] = 0;
      });
      
      // Initialize size quantities with actual size options
      sizeOptions.forEach(size => {
        initialSizeQuantities[size.name] = 0;
      });
      
      setModalState(prev => ({
        ...prev,
        colorQuantities: initialColorQuantities,
        sizeQuantities: initialSizeQuantities
      }));
    }
  }, [product, colorOptions, sizeOptions]);

  // Debug: Log variations data
  useEffect(() => {
    if (product) {
      console.log('Product variations:', product.variations);
      console.log('All variations:', allVariations);
      console.log('Color options:', colorOptions);
      console.log('Size options:', sizeOptions);
      console.log('Other variations:', otherVariations);
      console.log('Has variations:', hasVariations);
    }
  }, [product, allVariations, colorOptions, sizeOptions, otherVariations, hasVariations]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        console.log('Fetched product data:', data);
        console.log('Product images from API:', data.images);
        console.log('Product img from API:', data.img);
        setProduct(data);
        
        // Set initial quantity
        setQuantity(data.moq || 1);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      // Determine the selected variation combination
      let variantId = '';
      let variantName = '';
      let variationAttributes: { name: string; value: string; }[] = [];
      
      if (selectedCombination) {
        // Use selected combination from variations
        variantId = selectedCombination.id;
        const attributes = Object.entries(selectedCombination.attributes);
        variantName = attributes.map(([, value]) => value).join(' ');
        variationAttributes = attributes.map(([name, value]) => ({ name, value }));
      } else if (selectedColor || selectedSize) {
        // Fallback to individual selections
        const parts = [];
        if (selectedColor) parts.push(selectedColor);
        if (selectedSize) parts.push(selectedSize);
        variantName = parts.join(' ');
        variantId = `${selectedColor || 'default'}-${selectedSize || 'default'}`;
        
        if (selectedColor) variationAttributes.push({ name: 'color', value: selectedColor });
        if (selectedSize) variationAttributes.push({ name: 'size', value: selectedSize });
      }

      // Get the tier price for quantity 1 (minimum tier)
      const tierPrice = pricingTiers[0]?.price || product.price;
      const currentTierPrice = pricingTiers[modalState.selectedTier]?.price || tierPrice;
      
      if (selectedColor) {
        await addToCart({
          type: 'regular',
          productId: product._id as any,
          productName: product.title,
          productImage: product.images?.[0],
          quantity: quantity,
          unitPrice: currentTierPrice,
          totalPrice: currentTierPrice * quantity,
          supplierId: product.supplier._id as any,
          supplierName: product.supplier.name || product.supplier.companyName || 'Unknown Supplier',
          addedAt: new Date(),
          isBulkOrder: quantity >= (product.moq || 1),
          minOrderQuantity: product.moq,
          maxOrderQuantity: (product as any).maxOrderQuantity,
          bulkDiscount: (product as any).bulkDiscount,
          variantId: variantId || undefined,
          variantName: variantName || undefined,
          color: selectedColor || undefined,
          size: selectedSize || undefined,
          variationAttributes: variationAttributes.length > 0 ? variationAttributes : undefined
        });
      }
      
      showToast('Product added to cart successfully!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add product to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };



  if (loading) {
    return (
      <PageLayout
        title="Loading Product - WholesaleHub"
        description="Loading product details"
        showHeader={true}
        showFooter={true}
        showMegaMenu={false}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout
        title="Product Not Found - WholesaleHub"
        description="Product not found"
        showHeader={true}
        showFooter={true}
        showMegaMenu={false}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <button
              onClick={() => router.push('/search')}
              className="btn-primary px-6 py-3"
            >
              Browse Products
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${product.title} - WholesaleHub`}
      description={product.description}
      showHeader={true}
      showFooter={true}
      showMegaMenu={false}
    >
      <div className="bg-white min-h-screen">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center text-sm">
              <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">Home</span>
              <FiChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">{product?.category || 'Electronics'}</span>
              <FiChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="text-gray-700 font-medium truncate">{product?.title}</span>
            </div>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
            {/* Left: Product Images */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Product Title & Basic Info */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.title}
                </h1>
                
                {/* Rating & Sales Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 4.8) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{product.rating || 4.8}</span>
                    <span className="text-gray-600">({product.reviewCount || 127} reviews)</span>
                  </div>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-green-600">{product.sold || 235}</span>
                    <span className="text-gray-600">sold</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Image Gallery */}
              <div className="space-y-4">
                {/* Main Image with Advanced Features */}
                <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative group cursor-zoom-in">
                    {(() => {
                      const imageUrl = product.images?.[selectedImageIndex] || product.img;
                      console.log('Product images:', product.images);
                      console.log('Selected image URL:', imageUrl);
                      console.log('Selected index:', selectedImageIndex);
                      
                      if (imageUrl && imageUrl.trim() !== '') {
                        return (
                          <Image
                            src={imageUrl}
                            alt={product.title}
                            width={800}
                            height={800}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                            priority
                            onError={(e) => {
                              console.log('Image load error:', e);
                            }}
                          />
                        );
                      } else {
                        return (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                            <div className="text-center">
                              <div className="text-4xl mb-2">📷</div>
                              <div className="text-sm">No Image Available</div>
                              <div className="text-xs mt-1">Debug: {JSON.stringify({images: product.images, img: product.img})}</div>
                            </div>
                          </div>
                        );
                      }
                    })()}
                    
                    {/* Navigation Arrows */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : product.images.length - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        >
                          <FiChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(selectedImageIndex < product.images.length - 1 ? selectedImageIndex + 1 : 0)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        >
                          <FiChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                        {selectedImageIndex + 1} / {product.images.length}
                      </div>
                    )}

                    {/* Action Buttons Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-4">
                        <button className="bg-white/90 hover:bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
                          <FiZoomIn className="w-6 h-6 text-gray-700" />
                        </button>
                        <button className="bg-white/90 hover:bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
                          <FiHeart className="w-6 h-6 text-gray-700 hover:text-red-500" />
                        </button>
                        <button className="bg-white/90 hover:bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
                          <FiShare2 className="w-6 h-6 text-gray-700 hover:text-indigo-500" />
                        </button>
                      </div>
                    </div>

                    {/* Zoom Indicator */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <FiMaximize2 className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Thumbnail Gallery */}
                <div className="space-y-3">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {product.images?.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                          selectedImageIndex === index
                            ? 'border-orange-500 ring-2 ring-orange-200 shadow-lg scale-105'
                            : 'hover:border-orange-300 hover:shadow-md hover:scale-102'
                        }`}
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={`${product.title} ${index + 1}`}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            <div className="text-xs">📷</div>
                          </div>
                        )}
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 bg-orange-500/20 rounded-xl" />
                        )}
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                          {index + 1}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Gallery Actions */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium">
                        <FiHeart className="w-4 h-4" />
                        Add to wishlist
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                        <FiShare2 className="w-4 h-4" />
                        Share product
                      </button>
                    </div>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
                      <FiMaximize2 className="w-4 h-4" />
                      View fullscreen
                    </button>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {product.supplier?.name?.charAt(0) || product.supplier?.companyName?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {product.supplier?.name || product.supplier?.companyName || 'Verified Supplier'}
                      </h3>
                      {product.supplier?.verified && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Verified
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-medium text-gray-900">{product.supplier?.location || 'Global'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Response rate:</span>
                        <span className="ml-2 font-medium text-green-600">95%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Years in business:</span>
                        <span className="ml-2 font-medium text-gray-900">5+ years</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Response time:</span>
                        <span className="ml-2 font-medium text-gray-900">&lt; 24 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">MOQ:</span>
                      <span className="font-medium text-gray-900">{product.moq} pieces</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium text-green-600">{product.stock} available</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium text-gray-900">{product.unit}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Warranty:</span>
                      <span className="font-medium text-gray-900">1 Year</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium text-gray-900">Worldwide</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Enhanced Professional Sidebar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-6 h-fit lg:sticky lg:top-4">
              
              {/* Main Price Display */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    PKR {pricingTiers[0]?.price?.toFixed(2) || product?.price?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Starting price for {pricingTiers[0]?.minQty || 1}+ pieces
                  </div>
                  {product?.comparePrice && product.comparePrice > (pricingTiers[0]?.price || product.price) && (
                    <div className="text-sm text-gray-500 line-through mt-1">
                      PKR {product.comparePrice.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity-based Pricing Tiers */}
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-2">
                  {pricingTiers.map((tier, index) => (
                    <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">
                        {tier.minQty} - {tier.maxQty ? tier.maxQty : '∞'}
                      </div>
                      <div className="text-sm font-bold text-orange-600">
                        PKR{tier.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variations Section - Only show if product has variations */}
              {hasVariations && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">Variations</h4>
                    <button className="text-orange-600 hover:text-orange-700 text-xs font-medium">
                      Select now
                    </button>
                  </div>

                  {/* Color Selection */}
                  {colorOptions.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">Color:</span>
                        <span className="text-sm text-gray-900 font-medium">{selectedColor || colorOptions[0]?.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {colorOptions.map((color, index) => {
                          // Calculate total quantity for this color from modal state
                          const colorQuantity = Object.entries(modalState.variationQuantities)
                            .filter(([key]) => key.startsWith(`${color.name}-`))
                            .reduce((sum, [, qty]) => sum + qty, 0);
                          
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedColor(color.name)}
                              className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
                                selectedColor === color.name || (!selectedColor && index === 0)
                                  ? 'border-orange-500 ring-2 ring-orange-200'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color.hexCode }}
                              title={color.name}
                            >
                              {color.name === 'White' && (
                                <div className="w-full h-full border border-gray-200 rounded-lg" />
                              )}
                              
                              {/* Quantity Badge */}
                              {colorQuantity > 0 && (
                                <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                                  {colorQuantity}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {sizeOptions.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">Size:</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {sizeOptions.map((size, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedSize(size.name)}
                            className={`px-4 py-2 border rounded-lg transition-all font-medium ${
                              selectedSize === size.name || (!selectedSize && index === 0)
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            }`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Variations (Material, Style, etc.) */}
                  {otherVariations.map((variation, varIndex) => (
                    <div key={varIndex} className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">{variation.name}:</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {variation.values.map((value, valueIndex) => (
                          <button
                            key={valueIndex}
                            className="px-4 py-2 border rounded-lg transition-all font-medium border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50"
                          >
                            {value.name}
                            {value.priceModifier && value.priceModifier !== 0 && (
                              <span className="ml-2 text-xs text-orange-600">
                                {value.priceModifier > 0 ? '+' : ''}PKR{value.priceModifier}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipping Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Shipping</h4>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTruck className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Express Delivery</span>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Fast</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      Est. <span className="font-semibold text-orange-600">PKR {product?.shipping?.shippingCost?.toLocaleString() || '18,129'}</span>
                      <span className="text-gray-500 ml-1">for 10 pieces</span>
                    </div>
                    <div>Delivery by <span className="font-semibold text-gray-900">{product?.shipping?.estimatedDelivery || '20 Oct'}</span></div>
                  </div>
                </div>
              </div>

              {/* Dropshipping Option */}
              <div className="mb-6">
                <DropshippingOption
                  isAvailable={product?.shipping?.dropshippingAvailable || false}
                  fee={product?.shipping?.dropshippingFee}
                  onDropshippingChange={(isDropshipping, customerAddress, instructions) => {
                    setIsDropshipping(isDropshipping);
                    setCustomerAddress(customerAddress);
                    setDropshippingInstructions(instructions || '');
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                  Start Order
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowVariationModal(true)}
                    className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Add to cart
                  </button>
                  
                  <button className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600 py-3 px-4 rounded-xl font-medium transition-all duration-200">
                    <FiMessageCircle className="w-4 h-4" />
                    Chat now
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Buyer Protection</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <FiShield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-green-900">Secure Payment</div>
                      <div className="text-xs text-green-700">SSL encrypted transactions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <FiTruck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">Fast Delivery</div>
                      <div className="text-xs text-blue-700">Guaranteed on-time delivery</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <FiRefreshCw className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-purple-900">Easy Returns</div>
                      <div className="text-xs text-purple-700">30-day return policy</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
                  <FiShield className="w-3 h-3 text-orange-600" />
                  <span>Protected by <span className="font-medium text-gray-900">WholesaleHub</span> Trade Assurance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variation Selection Modal */}
        {showVariationModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowVariationModal(false)}
            />
            
            {/* Modal Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-all duration-300 ease-out">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Select variations and quantity</h2>
                  <button
                    onClick={() => setShowVariationModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Pricing Tiers */}
                  <div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                      {pricingTiers.map((tier, index) => (
                        <div 
                          key={index} 
                          className="text-center p-1 rounded"
                        >
                          <div className="text-gray-600 mb-1 text-xs">
                            {tier.minQty} - {tier.maxQty ? tier.maxQty : '∞'} pieces
                          </div>
                          <div className={`text-base font-bold ${
                            modalState.selectedTier === index ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            PKR {tier.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">Color: {selectedColor || 'Gray'}</span>
                    </div>
                    <div className="flex gap-2">
                      {colorOptions.map((color, index) => {
                        // Calculate quantity for this specific color only
                        const colorQuantity = modalState.colorQuantities[color.name] || 0;
                        return (
                          <div key={index} className="relative">
                            <div 
                              className={`w-8 h-8 rounded border-2 cursor-pointer transition-all ${
                                selectedColor === color.name || (!selectedColor && color.name === 'Gray')
                                  ? 'border-orange-500 ring-2 ring-orange-200'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color.hexCode }}
                              onClick={() => setSelectedColor(color.name)}
                            >
                              {color.name === 'White' && (
                                <div className="w-full h-full border border-gray-200 rounded" />
                              )}
                              {colorQuantity > 0 && (
                                <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                  {colorQuantity}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Cup Size</h3>
                    <div className="space-y-3">
                      {sizeOptions.map((size, index) => {
                        const quantity = modalState.sizeQuantities[size.name] || 0;
                        const currentTierPrice = pricingTiers[modalState.selectedTier]?.price || product?.price || 0;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <button
                                className={`px-3 py-1 border rounded transition-all ${
                                  selectedSize === size.name || (!selectedSize && size.name === 'M')
                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onClick={() => setSelectedSize(size.name)}
                              >
                                {size.name}
                              </button>
                              <span className="text-sm text-gray-600">
                                {modalState.variationQuantities[`${selectedColor || colorOptions[0]?.name}-${size.name}`] || 0} pieces
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  const variationKey = `${selectedColor || colorOptions[0]?.name}-${size.name}`;
                                  const currentQty = modalState.variationQuantities[variationKey] || 0;
                                  if (currentQty > 0) {
                                    const newVariationQuantities = { ...modalState.variationQuantities };
                                    newVariationQuantities[variationKey] = currentQty - 1;
                                    const newTotalQuantity = Object.values(newVariationQuantities).reduce((sum, qty) => sum + qty, 0);
                                    setModalState(prev => ({
                                      ...prev,
                                      variationQuantities: newVariationQuantities,
                                      totalQuantity: newTotalQuantity,
                                      subtotal: newTotalQuantity * (pricingTiers[prev.selectedTier]?.price || 0)
                                    }));
                                  }
                                }}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                              >
                                -
                              </button>
                              
                              <span className="w-8 text-center font-medium">
                                {modalState.variationQuantities[`${selectedColor || colorOptions[0]?.name}-${size.name}`] || 0}
                              </span>
                              
                              <button 
                                onClick={() => {
                                  const variationKey = `${selectedColor || colorOptions[0]?.name}-${size.name}`;
                                  const currentQty = modalState.variationQuantities[variationKey] || 0;
                                  const newVariationQuantities = { ...modalState.variationQuantities };
                                  newVariationQuantities[variationKey] = currentQty + 1;
                                  const newTotalQuantity = Object.values(newVariationQuantities).reduce((sum, qty) => sum + qty, 0);
                                  setModalState(prev => ({
                                    ...prev,
                                    variationQuantities: newVariationQuantities,
                                    totalQuantity: newTotalQuantity,
                                    subtotal: newTotalQuantity * (pricingTiers[prev.selectedTier]?.price || 0)
                                  }));
                                }}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Shipping</h3>
                    {modalState.subtotal >= 6336.88 ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                            <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                          </svg>
                        </div>
                        <span className="text-sm text-green-800">
                          You qualify for <span className="font-semibold text-orange-600">PKR 6,336.88 off</span> shipping
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <span className="text-sm text-orange-800">
                          <span className="font-semibold text-orange-600">FREE shipping</span> capped at PKR 6,336.88 on your first order
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-900">Subtotal</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        PKR {modalState.subtotal.toLocaleString()}
                        {modalState.totalQuantity > 0 && (
                          <span className="text-sm font-normal text-gray-600 ml-1">
                            (PKR {(modalState.subtotal / modalState.totalQuantity).toFixed(2)}/piece)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={async () => {
                      if (modalState.totalQuantity === 0) {
                        showToast('Please select at least one item', 'error');
                        return;
                      }
                      
                      setAddingToCart(true);
                      try {
                        // Create cart items based on the selected variations
                        const cartItems = [];
                        const currentTierPrice = pricingTiers[modalState.selectedTier]?.price || product.price;
                        
                        // Create cart items from variation quantities
                        for (const [variationKey, quantity] of Object.entries(modalState.variationQuantities)) {
                          if (quantity > 0) {
                            const [colorName, sizeName] = variationKey.split('-');
                            
                            const cartItem = {
                              type: 'regular' as const,
                              productId: product._id,
                              quantity: quantity,
                              tierPrice: currentTierPrice,
                              variantId: `${variationKey}-tier${modalState.selectedTier}`,
                              variantName: `${colorName}, ${sizeName}, Tier ${modalState.selectedTier + 1}`,
                              color: colorName,
                              size: sizeName,
                              variationAttributes: [
                                { name: 'color', value: colorName },
                                { name: 'size', value: sizeName }
                              ],
                              isBulkOrder: quantity >= (product.moq || 1)
                            };
                            cartItems.push(cartItem);
                          }
                        }
                        
                        // Fallback for products without variations
                        if (cartItems.length === 0 && modalState.totalQuantity > 0) {
                          const cartItem = {
                            type: 'regular' as const,
                            productId: product._id,
                            productName: product.title,
                            productImage: product.images?.[0] || '',
                            quantity: modalState.totalQuantity,
                            unitPrice: currentTierPrice,
                            totalPrice: currentTierPrice * modalState.totalQuantity,
                            supplierId: product.supplier._id,
                            supplierName: product.supplier.name || product.supplier.companyName || 'Unknown Supplier',
                            addedAt: new Date(),
                            isBulkOrder: modalState.totalQuantity >= (product.moq || 1),
                            minOrderQuantity: product.moq,
                            maxOrderQuantity: product.stock,
                            variantId: `default-tier${modalState.selectedTier}`,
                            variantName: `Tier ${modalState.selectedTier + 1}`,
                            color: 'default',
                            size: 'default',
                            variationAttributes: []
                          };
                          cartItems.push(cartItem);
                        }
                        
                        // Add all cart items
                        for (const cartItem of cartItems) {
                          await addToCart(cartItem);
                        }
                        showToast('Items added to cart successfully!', 'success');
                        setShowVariationModal(false);
                        
                        // Reset modal state with real variations
                        const resetVariationQuantities: Record<string, number> = {};
                        
                        // Initialize all variation combinations to 0
                        colorOptions.forEach(color => {
                          sizeOptions.forEach(size => {
                            resetVariationQuantities[`${color.name}-${size.name}`] = 0;
                          });
                        });
                        
                        setModalState({
                          selectedTier: 0,
                          variationQuantities: resetVariationQuantities,
                          totalQuantity: 0,
                          subtotal: 0
                        });
                      } catch (error) {
                        console.error('Error adding to cart:', error);
                        showToast('Failed to add items to cart. Please try again.', 'error');
                      } finally {
                        setAddingToCart(false);
                      }
                    }}
                    disabled={addingToCart || modalState.totalQuantity === 0}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    {addingToCart ? 'Adding...' : 'Add to cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Order Sliding Panel */}
        {showCustomOrderPanel && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl transform transition-all duration-300 ease-out animate-slide-in-right">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Add to Cart</h2>
                  <button
                    onClick={() => setShowCustomOrderPanel(false)}
                    className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Quantity Pricing Tiers */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Quantity Pricing</h3>
                    <div className="space-y-2">
                      {[
                        { range: '100-499', price: 'PKR 301.12' },
                        { range: '500-999', price: 'PKR 294.78' },
                        { range: '1000-4999', price: 'PKR 285.27' },
                        { range: '5000-9999', price: 'PKR 278.93' },
                        { range: '≥10000', price: 'PKR 270.45' }
                      ].map((tier, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            customOrder.quantity >= parseInt(tier.range.split('-')[0]) 
                              ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md' 
                              : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                          }`}
                          onClick={() => setCustomOrder(prev => ({ 
                            ...prev, 
                            quantity: parseInt(tier.range.split('-')[0]) 
                          }))}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{tier.range} pieces</span>
                            <span className="text-lg font-bold text-red-600">{tier.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Variations */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Color Variations</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Black', color: '#1a1a1a', qty: 0 },
                        { name: 'Blue', color: '#2563eb', qty: 0 },
                        { name: 'Green', color: '#059669', qty: 0 },
                        { name: 'Red', color: '#dc2626', qty: 0 }
                      ].map((colorOption, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: colorOption.color }}
                            />
                            <span className="text-sm font-medium">{colorOption.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-1 bg-gray-50 rounded text-sm min-w-[40px] text-center">
                              {colorOption.qty}
                            </span>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Size Options */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Size Options</h3>
                    <div className="flex flex-wrap gap-2">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <button
                          key={size}
                          className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
                            customOrder.size === size
                              ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-md'
                              : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                          }`}
                          onClick={() => setCustomOrder(prev => ({ ...prev, size }))}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material Options */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Material</h3>
                    <div className="space-y-2">
                      {['Cotton', 'Polyester', 'Blend', 'Custom'].map((material) => (
                        <label key={material} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="material"
                            value={material}
                            checked={customOrder.material === material}
                            onChange={(e) => setCustomOrder(prev => ({ ...prev, material: e.target.value }))}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm">{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Requirements */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Custom Requirements</h3>
                    <textarea
                      value={customOrder.customizations}
                      onChange={(e) => setCustomOrder(prev => ({ ...prev, customizations: e.target.value }))}
                      placeholder="Specify branding, packaging, or other custom requirements..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={4}
                    />
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Delivery Date</h3>
                    <input
                      type="date"
                      value={customOrder.deliveryDate}
                      onChange={(e) => setCustomOrder(prev => ({ ...prev, deliveryDate: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Order Urgency */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Order Urgency</h3>
                    <div className="space-y-2">
                      {[
                        { value: 'normal', label: 'Normal', desc: 'Standard processing time' },
                        { value: 'urgent', label: 'Urgent', desc: 'Priority processing (+15% fee)' },
                        { value: 'express', label: 'Express', desc: 'Rush processing (+30% fee)' }
                      ].map((urgency) => (
                        <label key={urgency.value} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="radio"
                            name="urgency"
                            value={urgency.value}
                            checked={customOrder.urgency === urgency.value}
                            onChange={(e) => setCustomOrder(prev => ({ ...prev, urgency: e.target.value }))}
                            className="mt-1 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{urgency.label}</div>
                            <div className="text-sm text-gray-600">{urgency.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">Subtotal:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      PKR {(customOrder.quantity * product.price).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!product || !session) {
                        showToast('Please sign in to add products to cart', 'info');
                        return;
                      }
                      
                      setAddingToCart(true);
                      try {
                        // Create cart item with custom order details
                        // Calculate tier price based on custom order quantity
                        let customTierPrice = product.price;
                        for (let i = 0; i < pricingTiers.length; i++) {
                          if (customOrder.quantity >= pricingTiers[i].minQty) {
                            if (!pricingTiers[i].maxQty || customOrder.quantity <= (pricingTiers[i].maxQty || 0)) {
                              customTierPrice = pricingTiers[i].price;
                              break;
                            } else if (i === pricingTiers.length - 1) {
                              customTierPrice = pricingTiers[i].price; // Last tier with no max limit
                            }
                          }
                        }

                        const cartItem = {
                          type: 'regular' as const,
                          productId: product._id,
                          quantity: customOrder.quantity,
                          tierPrice: customTierPrice,
                          variantId: `custom-${customOrder.color}-${customOrder.size}-${customOrder.material}`,
                          variantName: `Custom Order: ${[customOrder.color, customOrder.size, customOrder.material, customOrder.urgency].filter(Boolean).join(', ')}`,
                          color: customOrder.color,
                          size: customOrder.size,
                          material: customOrder.material,
                          variationAttributes: [
                            { name: 'color', value: customOrder.color },
                            { name: 'size', value: customOrder.size },
                            { name: 'material', value: customOrder.material },
                            { name: 'urgency', value: customOrder.urgency }
                          ].filter(attr => attr.value),
                          isBulkOrder: customOrder.quantity >= (product.moq || 1)
                        };

                        await addToCart(cartItem);
                        showToast('Custom order added to cart successfully!', 'success');
                        setShowCustomOrderPanel(false);
                      } catch (error) {
                        console.error('Error adding custom order to cart:', error);
                        showToast('Failed to add custom order to cart. Please try again.', 'error');
                      } finally {
                        setAddingToCart(false);
                      }
                    }}
                    disabled={addingToCart}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ToastContainer />
      </div>
    </PageLayout>
  );
}