"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: Props) {
  const safeImages = images && images.length > 0 ? images : ["/placeholder.png"];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      <div className="hidden sm:flex flex-col gap-2 w-16">
        {safeImages.map((src, i) => (
          <button
            key={i}
            className={`relative aspect-square border rounded overflow-hidden ${i === active ? 'border-indigo-600' : 'border-gray-100'}`}
            onClick={() => setActive(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative flex-1 aspect-square bg-gray-50 rounded-lg overflow-hidden">
        {safeImages[active] ? (
          <Image src={safeImages[active]} alt={title} fill className="object-cover cursor-zoom-in" onClick={() => setZoom(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
        )}
      </div>

      {/* Zoom lightbox */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setZoom(false)}>
          <div className="relative w-[90vw] h-[90vh]">
            <Image src={safeImages[active]} alt={title} fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
