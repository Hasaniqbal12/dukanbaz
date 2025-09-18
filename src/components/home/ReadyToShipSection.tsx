import Image from "next/image";
import Link from "next/link";

const items = [
  { id: 11, title: "Industrial Drill", img: "https://images.unsplash.com/photo-1581141893627-19d9874c4c1b?w=400&h=300&fit=crop&crop=center", price: "Rs 13,000", moq: "10 pcs", lead: "7 days" },
  { id: 12, title: "Premium T-Shirt", img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&h=300&fit=crop&crop=center", price: "Rs 640", moq: "200 pcs", lead: "5 days" },
  { id: 13, title: "Smart Watch", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&crop=center", price: "Rs 7,000", moq: "50 pcs", lead: "3 days" },
  { id: 14, title: "Solar Light", img: "https://images.unsplash.com/photo-1564094467889-f4f7e3a00270?w=400&h=300&fit=crop&crop=center", price: "Rs 15,000", moq: "5 pcs", lead: "4 days" },
];

export default function ReadyToShipSection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">⚡ Ready to ship</h2>
        <Link href="/search?sort=ready" className="text-sm text-orange-600 hover:text-orange-700 font-semibold">See more</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <Link key={it.id} href={`/product/${it.id}`} className="group bg-white rounded-xl border border-gray-200 hover:border-orange-300 transition-colors overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={it.img} alt={it.title} fill className="object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-700">{it.title}</div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>MOQ: {it.moq}</span>
                <span>Lead: {it.lead}</span>
              </div>
              <div className="text-orange-600 font-bold mt-1">{it.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
