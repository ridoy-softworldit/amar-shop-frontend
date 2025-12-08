"use client";

import { useEffect, useMemo, useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Banner } from "@/types/banner";
import { ChevronRight } from "lucide-react";

const FALLBACK = [
  "/hero1.webp",
  "/hero2.webp",
  "/hero3.webp",
  "/hero4.webp",
  "/hero6.webp",
  "/hero7.webp",
];

function BannerCarouselBase({
  items,
  autoMs = 3000,
  heightClass = "h-[160px] sm:h-[280px] lg:h-full",
}: {
  items: Banner[]; // DB থেকে আসবে
  autoMs?: number;
  heightClass?: string;
}) {
  const sources = useMemo(() => {
    // DB খালি হলে পুরনো স্ট্যাটিক fallback ই দেখাই
    return items?.length ? items.map((b) => b.image) : FALLBACK;
  }, [items]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!sources.length) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % sources.length),
      autoMs
    );
    return () => clearInterval(t);
  }, [sources.length, autoMs]);

  return (
    <div
      className={`relative w-full rounded-md overflow-hidden border border-red-200 bg-white shadow-sm ${heightClass}`}
    >
      <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
        {sources.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Banner ${i + 1}`}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              width: 'auto', 
              height: 'auto',
              position: 'absolute',
              transition: 'all 0.7s ease-in-out',
              transform: i === index ? 'translateX(0)' : 'translateX(-100%)',
              opacity: i === index ? 1 : 0
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="absolute bottom-4 left-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 text-rose-700 px-3 py-1.5 text-xs sm:text-sm font-medium shadow hover:shadow-md hover:-translate-y-0.5 transition"
        >
          Shop now <ChevronRight size={14} />
        </Link>
      </div>

      {/* Dots */}
      <div className="absolute bottom-2 right-3 flex gap-1.5">
        {sources.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition ${
              i === index ? "bg-rose-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export const BannerCarousel = memo(BannerCarouselBase);
