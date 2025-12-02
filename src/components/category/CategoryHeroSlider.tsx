"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

type Banner = {
  _id?: string;
  image?: string;
  title?: string;
  link?: string;
};

export default function CategoryHeroSlider({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  const safeBanners = Array.isArray(banners) && banners.length ? banners : [];

  useEffect(() => {
    if (!safeBanners.length) return;
    timerRef.current = window.setInterval(() => {
      setIdx((s) => (s + 1) % safeBanners.length);
    }, 4500);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [safeBanners.length]);

  const prev = () => {
    if (!safeBanners.length) return;
    setIdx((s) => (s - 1 + safeBanners.length) % safeBanners.length);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const next = () => {
    if (!safeBanners.length) return;
    setIdx((s) => (s + 1) % safeBanners.length);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  if (!safeBanners.length) {
    return (
      <div className="w-full h-56 md:h-80 lg:h-96 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
        No banners
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden">
      <div className="w-full h-56 md:h-80 lg:h-96 relative">
        <Image
          src={safeBanners[idx]?.image ?? "/images/placeholder.png"}
          alt={safeBanners[idx]?.title ?? "banner"}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width:640px) 100vw, 100vw"
          priority={idx === 0}
        />
        {/* overlay title */}
        {safeBanners[idx]?.title && (
          <div className="absolute left-4 bottom-6 bg-black/40 text-white px-3 py-2 rounded-md">
            <h3 className="font-semibold text-sm md:text-base">
              {safeBanners[idx]?.title}
            </h3>
          </div>
        )}
      </div>

      {/* controls */}
      <button
        aria-label="Previous"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow"
      >
        ‹
      </button>
      <button
        aria-label="Next"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow"
      >
        ›
      </button>

      {/* indicators */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 z-20">
        {safeBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`}
            aria-label={`Goto slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
