import Link from "next/link";

const tiles = [
  { title: "Customized products", desc: "Made-to-order with your specs", href: "/customized" },
  { title: "Sample ready", desc: "Try before bulk order", href: "/samples" },
  { title: "Ready-to-ship deals", desc: "Fast dispatch inventory", href: "/search?sort=ready" },
  { title: "Verified suppliers", desc: "Audited and trusted", href: "/suppliers?verified=1" },
];

export default function CustomizedProductsSection() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <div className="h-16 w-16 rounded-xl bg-indigo-100 text-indigo-700 mb-3" aria-hidden />
            <div className="font-bold text-gray-900 group-hover:text-indigo-700">{t.title}</div>
            <div className="text-sm text-gray-600">{t.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
