import { FiShield, FiRefreshCw, FiTruck, FiHeadphones } from "react-icons/fi";

export default function TradeAssuranceSection() {
  const items = [
    { icon: FiShield, title: "Trade Assurance", desc: "Order protection for safe payments" },
    { icon: FiTruck, title: "On-time delivery", desc: "Reliable shipping from verified suppliers" },
    { icon: FiRefreshCw, title: "Refund policy", desc: "Safeguards for your purchase" },
    { icon: FiHeadphones, title: "24/7 support", desc: "We’re here to help" },
  ];

  return (
    <section className="py-8">
      <div className="bg-white border border-gray-200 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{title}</div>
              <div className="text-sm text-gray-500">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
