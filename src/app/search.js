"use client";

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const allProducts = [
  {
    id: 1,
    title: "Bluetooth Headphones",
    img: "/globe.svg",
    price: 12.5,
    supplier: "Shenzhen Audio Co.",
    category: "Electronics",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Men's T-Shirts",
    img: "/window.svg",
    price: 3.2,
    supplier: "Guangzhou Apparel Ltd.",
    category: "Apparel",
    rating: 4.0,
  },
  {
    id: 3,
    title: "Industrial Drill",
    img: "/file.svg",
    price: 55.0,
    supplier: "Wuhan Machinery",
    category: "Machinery",
    rating: 4.2,
  },
  {
    id: 4,
    title: "Ceramic Vase",
    img: "/vercel.svg",
    price: 8.0,
    supplier: "Jingdezhen Ceramics",
    category: "Home & Garden",
    rating: 4.7,
  },
  {
    id: 5,
    title: "Face Cream",
    img: "/next.svg",
    price: 4.5,
    supplier: "Shanghai Beauty",
    category: "Beauty",
    rating: 4.8,
  },
  {
    id: 6,
    title: "Toy Car",
    img: "/globe.svg",
    price: 2.0,
    supplier: "Yiwu Toys",
    category: "Toys",
    rating: 4.1,
  },
  {
    id: 7,
    title: "Soccer Ball",
    img: "/window.svg",
    price: 5.0,
    supplier: "Jiangsu Sports",
    category: "Sports",
    rating: 4.3,
  },
  {
    id: 8,
    title: "Car LED Light",
    img: "/file.svg",
    price: 7.5,
    supplier: "Guangzhou Auto Parts",
    category: "Automotive",
    rating: 4.0,
  },
  {
    id: 9,
    title: "Blender",
    img: "/vercel.svg",
    price: 29.99,
    supplier: "KitchenPro",
    category: "Home & Garden",
    rating: 4.6,
  },
  {
    id: 10,
    title: "Shampoo",
    img: "/next.svg",
    price: 3.99,
    supplier: "Shanghai Beauty",
    category: "Beauty",
    rating: 4.2,
  },
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating: High to Low" },
];

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("relevance");
  const [visible, setVisible] = useState(8);

  useEffect(() => {
    if (typeof q === "string") setSearch(q);
  }, [q]);

  let filtered = allProducts.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  if (sort === "price-asc") filtered = filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = filtered.sort((a, b) => b.price - a.price);
  if (sort === "rating-desc") filtered = filtered.sort((a, b) => b.rating - a.rating);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <>
      <Head>
        <title>Search Results | WholesaleHub</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-8 px-2 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          {/* Search Bar & Sort */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8 items-stretch sm:items-center">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="w-full sm:w-48 border border-gray-300 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition"
            >
              Search
            </button>
          </form>
          {/* Results Grid */}
          {filtered.length === 0 ? (
            <div className="text-gray-500 text-center py-12">No results found</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.slice(0, visible).map((prod) => (
                  <div key={prod.id} className="bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg transition">
                    <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded mb-4">
                      <Image src={prod.img} alt={prod.title} width={100} height={100} />
                    </div>
                    <div className="font-bold text-lg text-gray-900 mb-1">{prod.title}</div>
                    <div className="text-orange-600 font-bold mb-1">${prod.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mb-1">Supplier: {prod.supplier}</div>
                    <div className="text-xs text-yellow-500 mb-2">Rating: {prod.rating}</div>
                    <button className="mt-auto px-4 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition">View</button>
                  </div>
                ))}
              </div>
              {visible < filtered.length && (
                <div className="flex justify-center mt-8">
                  <button
                    className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition"
                    onClick={() => setVisible((v) => v + 8)}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
} 