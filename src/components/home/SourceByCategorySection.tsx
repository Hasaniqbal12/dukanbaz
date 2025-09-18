import Link from "next/link";

const categories = [
  { name: "Consumer Electronics", href: "/search?c=consumer-electronics" },
  { name: "Apparel", href: "/search?c=apparel" },
  { name: "Machinery", href: "/search?c=machinery" },
  { name: "Home & Garden", href: "/search?c=home-garden" },
  { name: "Beauty & Personal Care", href: "/search?c=beauty" },
  { name: "Packaging & Printing", href: "/search?c=packaging" },
  { name: "Gifts & Crafts", href: "/search?c=gifts" },
  { name: "Sports & Entertainment", href: "/search?c=sports" },
];

export default function SourceByCategorySection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Source by category</h2>
        <Link href="/search" className="text-sm text-orange-600 hover:text-orange-700 font-semibold">View all</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Link key={c.name} href={c.href} className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors">
            <div className="h-24 rounded-lg bg-gray-100 mb-3" aria-hidden />
            <div className="font-medium text-gray-900 group-hover:text-orange-700 text-sm">{c.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
