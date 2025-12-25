"use client";

import Link from "next/link";
import { Building2, ChevronRight as ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useGetManufacturersQuery } from "@/services/catalog.api";

export default function MobileManufacturersGrid() {
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useGetManufacturersQuery();
  const manufacturers = data?.data || [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !scrollRef.current || isLoading) return;
    const scrollContainer = scrollRef.current;
    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          const cardWidth = scrollContainer.offsetWidth * 0.32 + 12;
          const maxScroll = scrollContainer.scrollWidth - scrollContainer.offsetWidth;
          
          if (scrollContainer.scrollLeft >= maxScroll) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainer.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
          }
        }
      }, 3000);
    };

    startAutoScroll();

    return () => clearInterval(scrollInterval);
  }, [isMounted, isLoading, manufacturers.length]);

  if (!isMounted) {
    return (
      <section className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="text-[#167389]" size={20} />
            <h2 className="text-lg font-bold text-[#167389]">Manufacturers</h2>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="h-[156px] rounded-md border border-gray-200 bg-white p-3 flex flex-col items-center justify-start"
            >
              <div className="relative w-full h-[80%] rounded-md bg-gray-100 animate-pulse" />
              <div className="mt-2 h-3 w-20 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const items = Array.isArray(manufacturers) ? manufacturers.slice(0, 12) : [];

  return (
    <section className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="text-[#167389]" size={20} />
          <h2 className="text-lg font-bold text-[#167389]">Manufacturers</h2>
        </div>
        {!isLoading && (
          <Link
            href="/manufacturers"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#167389] hover:text-rose-600 transition"
          >
            Discover All <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide scroll-smooth">
        <div className="flex gap-3 pb-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className="min-w-[48%] max-w-[48%] shrink-0 h-[80px] rounded-md border border-gray-200 bg-white p-2 flex items-center gap-2"
                >
                  <div className="relative w-full h-[80%] rounded-md bg-gray-100 animate-pulse" />
                  <div className="mt-2 h-3 w-20 rounded bg-gray-100 animate-pulse" />
                </div>
              ))
            : items.map((manufacturer) => (
                <Link
                  key={`brand-${manufacturer._id ?? manufacturer.slug}`}
                  href={`/manufacturer/${manufacturer.slug}`}
                  className="group min-w-[48%] max-w-[48%] shrink-0 h-[80px] rounded-md border border-gray-200 bg-white p-2 flex items-center gap-2 hover:shadow-md hover:border-cyan-300 transition"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-1 shrink-0">
                    {manufacturer.image ? (
                      <img
                        src={manufacturer.image}
                        alt={manufacturer.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <p className="flex-1 text-[12px] font-extrabold text-gray-800 text-left leading-tight line-clamp-2 uppercase">
                    {manufacturer.name.toUpperCase()}
                  </p>
                </Link>
              ))}
          
          {/* See All Card */}
          {!isLoading && (
            <Link
              href="/manufacturers"
              className="min-w-[48%] max-w-[48%] shrink-0 h-[80px] rounded-md border border-gray-200 bg-white p-2 flex items-center justify-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700">See all</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}