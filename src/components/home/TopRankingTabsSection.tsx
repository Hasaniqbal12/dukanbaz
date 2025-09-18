"use client";

import { useState } from "react";
import Image from "next/image";

type Item = { id: number; title: string; img: string; price: string };

const tabs: { key: string; label: string; items: Item[] }[] = [
  {
    key: "top",
    label: "Top ranking",
    items: [
      { id: 1, title: "Wireless Headphones Pro", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center", price: "Rs 2,500" },
      { id: 2, title: "Premium Cotton T-Shirt", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center", price: "Rs 640" },
      { id: 3, title: "Drill Machine", img: "https://images.unsplash.com/photo-1581141893627-19d9874c4c1b?w=400&h=400&fit=crop&crop=center", price: "Rs 13,000" },
      { id: 4, title: "LED Strip", img: "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=400&fit=crop&crop=center", price: "Rs 350" },
      { id: 5, title: "Desk Lamp", img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop&crop=center", price: "Rs 1,599" },
    ],
  },
  {
    key: "hot",
    label: "Hot picks",
    items: [
      { id: 11, title: "Smart Watch", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center", price: "Rs 7,000" },
      { id: 12, title: "Hoodie", img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&h=400&fit=crop&crop=center", price: "Rs 999" },
      { id: 13, title: "Sports Bottle", img: "https://images.unsplash.com/photo-1611259181290-911ba0e7b9e1?w=400&h=400&fit=crop&crop=center", price: "Rs 399" },
      { id: 14, title: "Backpack", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=400&fit=crop&crop=center", price: "Rs 1,299" },
      { id: 15, title: "Bluetooth Speaker", img: "https://images.unsplash.com/photo-1518441902117-f6ce9fbec8aa?w=400&h=400&fit=crop&crop=center", price: "Rs 2,899" },
    ],
  },
];

export default function TopRankingTabsSection() {
  const [active, setActive] = useState(tabs[0].key);
  const activeTab = tabs.find((t) => t.key === active)!;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border ${
                active === t.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">Pakistan picks</span>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory scrollbar-hide">
        {activeTab.items.map((it) => (
          <div key={it.id} className="snap-start min-w-[220px] bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors overflow-hidden">
            <div className="relative aspect-square">
              <Image src={it.img} alt={it.title} fill className="object-cover" />
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-900 line-clamp-1">{it.title}</div>
              <div className="text-indigo-600 font-bold">{it.price}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
