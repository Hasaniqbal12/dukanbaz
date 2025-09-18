"use client";

import { FiShield, FiTruck, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

export default function TrustBadges() {
  const items = [
    { icon: FiShield, title: "Buyer Protection", desc: "Refund policy for quality issues" },
    { icon: FiTruck, title: "On-time Delivery", desc: "Fast & reliable shipping" },
    { icon: FiRefreshCw, title: "Easy Returns", desc: "Hassle-free returns policy" },
    { icon: FiCheckCircle, title: "Verified Supplier", desc: "Business verification done" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it, idx) => (
        <div key={idx} className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <it.icon className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-gray-900">{it.title}</div>
            <div className="text-xs text-gray-600">{it.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
