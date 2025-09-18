"use client";

import Image from "next/image";
import Link from "next/link";
import { FiPackage } from "react-icons/fi";

export interface RelatedItem {
  _id: string;
  title?: string;
  image?: string;
  price?: number;
  comparePrice?: number;
}

interface Props {
  items: RelatedItem[];
}

const formatPrice = (price?: number) => {
  if (typeof price !== 'number') return '';
  return `Rs ${price.toLocaleString()}`;
};

export default function RelatedProductsGrid({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiPackage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No related products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Link key={item._id} href={`/product/${item._id}`} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
          <div className="relative aspect-square bg-gray-50">
            {item.image ? (
              <Image src={item.image} alt={item.title || 'Product image'} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <FiPackage className="w-10 h-10" />
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-red-600 font-semibold">{formatPrice(item.price)}</div>
              {item.comparePrice && item.price && item.comparePrice > item.price && (
                <div className="text-xs text-gray-500 line-through">{formatPrice(item.comparePrice)}</div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
