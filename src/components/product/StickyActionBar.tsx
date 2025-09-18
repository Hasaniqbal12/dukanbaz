"use client";

import { FiMessageCircle, FiShoppingCart } from "react-icons/fi";

interface Props {
  onAddToCart: () => void;
  onContact: () => void;
  addingToCart?: boolean;
}

export default function StickyActionBar({ onAddToCart, onContact, addingToCart }: Props) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200">
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        <button
          onClick={onContact}
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-indigo-600 text-white font-medium"
        >
          <FiMessageCircle className="w-5 h-5" />
          Contact
        </button>
        <button
          onClick={onAddToCart}
          disabled={!!addingToCart}
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-indigo-700 text-white font-semibold disabled:opacity-50"
        >
          {addingToCart ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <FiShoppingCart className="w-5 h-5" />
          )}
          {addingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
