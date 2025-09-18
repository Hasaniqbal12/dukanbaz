import Link from "next/link";

const regions = [
  { name: "Karachi", href: "/suppliers?region=karachi" },
  { name: "Lahore", href: "/suppliers?region=lahore" },
  { name: "Islamabad", href: "/suppliers?region=islamabad" },
  { name: "Faisalabad", href: "/suppliers?region=faisalabad" },
  { name: "Multan", href: "/suppliers?region=multan" },
  { name: "Peshawar", href: "/suppliers?region=peshawar" },
  { name: "Sialkot", href: "/suppliers?region=sialkot" },
  { name: "Quetta", href: "/suppliers?region=quetta" },
];

export default function SupplierRegionSection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Supplier regions</h2>
        <Link href="/suppliers" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">Explore all</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {regions.map((r) => (
          <Link key={r.name} href={r.href} className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
            <div className="h-20 rounded-lg bg-gradient-to-br from-indigo-50 to-white border border-dashed border-indigo-200 mb-3" aria-hidden />
            <div className="font-medium text-gray-900 group-hover:text-indigo-700 text-sm">{r.name}</div>
            <div className="text-xs text-gray-500">Verified local suppliers</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
