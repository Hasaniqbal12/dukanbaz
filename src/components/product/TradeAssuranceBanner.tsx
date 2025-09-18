"use client";

import { FiShield, FiTruck, FiRotateCcw, FiCreditCard } from "react-icons/fi";

export default function TradeAssuranceBanner() {
  return (
    <div className="border border-amber-300 bg-amber-50 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-amber-800 font-semibold">
        <FiShield className="w-5 h-5" />
        WholesaleHub Trade Assurance
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-amber-900">
        <div className="flex items-center gap-2">
          <FiCreditCard className="w-4 h-4" /> Secure payments
        </div>
        <div className="flex items-center gap-2">
          <FiTruck className="w-4 h-4" /> On-time delivery
        </div>
        <div className="flex items-center gap-2">
          <FiRotateCcw className="w-4 h-4" /> Refund protection
        </div>
        <div className="flex items-center gap-2">
          <FiShield className="w-4 h-4" /> Supplier verification
        </div>
      </div>
    </div>
  );
}
