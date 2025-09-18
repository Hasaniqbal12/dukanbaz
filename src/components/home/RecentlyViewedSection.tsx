import Image from "next/image";
import Link from "next/link";

const items = [
  { id: 101, title: "Bluetooth Speaker", img: "https://images.unsplash.com/photo-1518441902117-f6ce9fbec8aa?w=400&h=300&fit=crop&crop=center", price: "Rs 2,899" },
  { id: 102, title: "Backpack", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=300&fit=crop&crop=center", price: "Rs 1,299" },
  { id: 103, title: "Desk Chair", img: "https://images.unsplash.com/photo-1582582429416-78d92d8d6494?w=400&h=300&fit=crop&crop=center", price: "Rs 9,999" },
  { id: 104, title: "Kitchen Utensil Set", img: "https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=400&h=300&fit=crop&crop=center", price: "Rs 799" },
  { id: 105, title: "Gym Gloves", img: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=300&fit=crop&crop=center", price: "Rs 499" },
];

export default function RecentlyViewedSection() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recently viewed</h2>
        <Link href="/history" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">View history</Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {items.map((d) => (
          <Link key={d.id} href={`/product/${d.id}`} className="snap-start min-w-[220px] bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-colors">
            <div className="relative aspect-[4/3]">
              <Image src={d.img} alt={d.title} fill className="object-cover" />
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-900 line-clamp-1">{d.title}</div>
              <div className="text-indigo-600 font-bold">{d.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
