import Image from "next/image";
import Link from "next/link";

const deals = [
  { id: 1, title: "Wireless Earbuds", img: "https://images.unsplash.com/photo-1598331668826-d84a547c9dff?w=400&h=300&fit=crop&crop=center", price: "Rs 2,199", discount: 35 },
  { id: 2, title: "Cotton Hoodie", img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&h=300&fit=crop&crop=center", price: "Rs 999", discount: 40 },
  { id: 3, title: "LED Strip Light", img: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop&crop=center", price: "Rs 350", discount: 20 },
  { id: 4, title: "Desk Lamp", img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=300&fit=crop&crop=center", price: "Rs 1,599", discount: 25 },
  { id: 5, title: "Sports Bottle", img: "https://images.unsplash.com/photo-1611259181290-911ba0e7b9e1?w=400&h=300&fit=crop&crop=center", price: "Rs 399", discount: 15 },
];

export default function DealsSection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🔥 Flash deals</h2>
        <div className="text-sm text-gray-500">Ends soon</div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {deals.map((d) => (
          <Link key={d.id} href={`/offers/${d.id}`} className="snap-start min-w-[240px] bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 transition-colors">
            <div className="relative aspect-[4/3]">
              <Image src={d.img} alt={d.title} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{d.discount}%</div>
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-900 line-clamp-1">{d.title}</div>
              <div className="text-orange-600 font-bold">{d.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
