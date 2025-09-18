"use client";

import { FiShield, FiMapPin, FiUsers, FiAward, FiGlobe, FiMail, FiPhone } from "react-icons/fi";

interface Supplier {
  _id: string;
  name: string;
  companyName?: string;
  location?: string;
  verified?: boolean;
}

interface Props {
  supplier: Supplier;
  onContact: () => void;
}

export default function SupplierCard({ supplier, onContact }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-gray-900 font-semibold text-base">{supplier.companyName || supplier.name}</div>
          <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
            <FiMapPin className="w-3.5 h-3.5" />
            {supplier.location || '—'}
          </div>
        </div>
        {supplier.verified && (
          <div className="flex items-center gap-1 text-green-600 text-xs bg-green-50 px-2 py-1 rounded">
            <FiShield className="w-3.5 h-3.5" /> Verified
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 mt-4 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span>Response Time: &lt; 24h</span>
        </div>
        <div className="flex items-center gap-2">
          <FiUsers className="w-4 h-4 text-gray-400" />
          <span>Business Type: Manufacturer</span>
        </div>
        <div className="flex items-center gap-2">
          <FiAward className="w-4 h-4 text-gray-400" />
          <span>Years in Business: 5+</span>
        </div>
        <div className="flex items-center gap-2">
          <FiGlobe className="w-4 h-4 text-gray-400" />
          <span>Main Markets: Pakistan</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={onContact} className="flex-1 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
          <FiMail className="w-4 h-4" />
          Send Message
        </button>
        <button className="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
          <FiPhone className="w-4 h-4" />
          Call Now
        </button>
      </div>
    </div>
  );
}
