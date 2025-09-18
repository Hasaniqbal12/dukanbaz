"use client";

import ProductVariations from './ProductVariations';

// Example product with Alibaba-style variations
const exampleProductVariations = {
  attributes: [
    {
      name: "Color",
      values: [
        { name: "Red", hexCode: "#FF0000" },
        { name: "Blue", hexCode: "#0000FF" },
        { name: "Green", hexCode: "#00FF00" },
        { name: "Black", hexCode: "#000000" },
        { name: "White", hexCode: "#FFFFFF" }
      ]
    },
    {
      name: "Size",
      values: [
        { name: "Small" },
        { name: "Medium" },
        { name: "Large" },
        { name: "X-Large" },
        { name: "XX-Large" }
      ]
    },
    {
      name: "Material",
      values: [
        { name: "Cotton" },
        { name: "Polyester" },
        { name: "Cotton Blend" },
        { name: "Premium Cotton" }
      ]
    }
  ],
  combinations: [
    // Red + Small + Cotton
    {
      attributes: [
        { name: "Color", value: "Red" },
        { name: "Size", value: "Small" },
        { name: "Material", value: "Cotton" }
      ],
      priceTiers: [
        { minQty: 100, maxQty: 499, price: 12.50, currency: "USD" },
        { minQty: 500, maxQty: 999, price: 11.80, currency: "USD" },
        { minQty: 1000, maxQty: 4999, price: 10.90, currency: "USD" },
        { minQty: 5000, price: 9.50, currency: "USD" }
      ],
      stock: 5000,
      moq: 100,
      sku: "TSH-RED-S-COT-001",
      leadTime: "7-10 days",
      images: ["/products/tshirt-red-small.jpg"],
      available: true
    },
    // Red + Medium + Cotton
    {
      attributes: [
        { name: "Color", value: "Red" },
        { name: "Size", value: "Medium" },
        { name: "Material", value: "Cotton" }
      ],
      priceTiers: [
        { minQty: 100, maxQty: 499, price: 12.80, currency: "USD" },
        { minQty: 500, maxQty: 999, price: 12.10, currency: "USD" },
        { minQty: 1000, maxQty: 4999, price: 11.20, currency: "USD" },
        { minQty: 5000, price: 9.80, currency: "USD" }
      ],
      stock: 8000,
      moq: 100,
      sku: "TSH-RED-M-COT-001",
      leadTime: "7-10 days",
      images: ["/products/tshirt-red-medium.jpg"],
      available: true
    },
    // Blue + Large + Premium Cotton (Higher price)
    {
      attributes: [
        { name: "Color", value: "Blue" },
        { name: "Size", value: "Large" },
        { name: "Material", value: "Premium Cotton" }
      ],
      priceTiers: [
        { minQty: 50, maxQty: 199, price: 18.50, currency: "USD" },
        { minQty: 200, maxQty: 499, price: 17.20, currency: "USD" },
        { minQty: 500, maxQty: 999, price: 15.90, currency: "USD" },
        { minQty: 1000, price: 14.50, currency: "USD" }
      ],
      stock: 2000,
      moq: 50,
      sku: "TSH-BLU-L-PREM-001",
      leadTime: "10-15 days",
      images: ["/products/tshirt-blue-large-premium.jpg"],
      available: true
    },
    // Black + X-Large + Polyester (Different pricing structure)
    {
      attributes: [
        { name: "Color", value: "Black" },
        { name: "Size", value: "X-Large" },
        { name: "Material", value: "Polyester" }
      ],
      priceTiers: [
        { minQty: 200, maxQty: 999, price: 8.90, currency: "USD" },
        { minQty: 1000, maxQty: 4999, price: 7.50, currency: "USD" },
        { minQty: 5000, price: 6.20, currency: "USD" }
      ],
      stock: 10000,
      moq: 200,
      sku: "TSH-BLK-XL-POL-001",
      leadTime: "5-7 days",
      images: ["/products/tshirt-black-xl-polyester.jpg"],
      available: true
    }
    // Add more combinations as needed...
  ]
};

export default function ProductVariationsExample() {
  const handleVariationChange = (combination: any, quantity: number) => {
    console.log('Selected combination:', combination);
    console.log('Quantity:', quantity);
    
    // Here you would typically:
    // 1. Update the main product image
    // 2. Update the price display
    // 3. Update the "Add to Cart" button state
    // 4. Send data to parent component or context
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Custom T-Shirt - Product Variations
      </h2>
      
      <ProductVariations 
        variations={exampleProductVariations}
        onVariationChange={handleVariationChange}
      />
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">How This Works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Each combination has its own pricing tiers</li>
          <li>• Different MOQs based on material and complexity</li>
          <li>• Stock levels tracked per combination</li>
          <li>• Lead times vary by material and availability</li>
          <li>• SKUs generated for inventory management</li>
        </ul>
      </div>
    </div>
  );
}
