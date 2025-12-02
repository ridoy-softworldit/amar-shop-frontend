"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  title,
  fallback,

}: {
  images?: string[] | null;
  title: string;
  
  fallback?: string;
  
}) {

  const list = useMemo(() => {
    const arr = Array.from(new Set((images ?? []).filter(Boolean)));
    if (arr.length === 0 && fallback) return [fallback];
    return arr;
  }, [images, fallback]);

  const [active, setActive] = useState(0);
  const main = list[active];

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 shadow-inner">
        {main ? (
          <Image
            src={main}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover hover:scale-105 transition-transform duration-500"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-pink-300">
           
            <svg
              className="w-20 h-20 sm:w-24 sm:h-24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14M3 19l4-4 3 3 5-5 6 6M3 19h18" />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbs */}
      {list.length > 1 && (
        <div className="mt-3 sm:mt-4">
          <div
            className="
              grid grid-flow-col auto-cols-[22%] xs:auto-cols-[20%] sm:auto-cols-[18%] md:auto-cols-[16%] lg:auto-cols-[14%]
              gap-2 sm:gap-3 overflow-x-auto pb-1
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
            aria-label="Product images"
            role="listbox"
          >
            {list.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                role="option"
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition
                  ${active === i ? "border-[#167389]" : "border-[#167389] hover:border-pink-300"}
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500
                `}
                title={`View image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${title} - ${i + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}
