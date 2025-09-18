"use client";

import { useEffect, useState } from "react";
import { FiMessageCircle, FiShoppingBag } from "react-icons/fi";

interface Props {
  title: string;
  priceText: string;
  onStartOrder: () => void;
  onContact: () => void;
}

export default function StickySubHeader({ title, priceText, onStartOrder, onContact }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 320);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4 py-2 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
          <div className="text-xs text-red-600 font-semibold truncate">{priceText}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onContact} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md border text-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
            <FiMessageCircle className="w-4 h-4" /> Contact
          </button>
          <button onClick={onStartOrder} className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-700 hover:bg-indigo-800 text-white text-sm">
            <FiShoppingBag className="w-4 h-4" /> Start Order
          </button>
        </div>
      </div>
    </div>
  );
}
