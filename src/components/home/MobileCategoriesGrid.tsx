"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight as ArrowRight } from "lucide-react";
import type { Category } from "@/lib/schemas";
import { useState, useEffect, useRef } from "react";

type Props = { categories: Category[]; loading?: boolean; title?: string };

export default function MobileCategoriesGrid({
  categories,
  loading = false,
  title = "Shop by Categories",
}: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !scrollRef.current || loading) return;
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
  }, [isMounted, loading, categories.length]);

  // FIX: Safe early return
  if (!isMounted) {
    return (
      <section className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#167389]" size={20} />
            <h2 className="text-lg font-bold text-[#167389]">{title}</h2>
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

  const items = Array.isArray(categories) ? categories.slice(0, 12) : [];

  return (
    <section className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#167389]" size={20} />
          <h2 className="text-lg font-bold text-[#167389]">{title}</h2>
        </div>
        {!loading && (
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#167389] hover:text-rose-600 transition"
          >
            View All <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide scroll-smooth">
        <div className="flex gap-3 pb-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className="min-w-[32%] max-w-[32%] shrink-0 h-[156px] rounded-md border border-gray-200 bg-white p-3 flex flex-col items-center justify-start"
                >
                  <div className="relative w-full h-[80%] rounded-md bg-gray-100 animate-pulse" />
                  <div className="mt-2 h-3 w-20 rounded bg-gray-100 animate-pulse" />
                </div>
              ))
            : items.map((cat) => (
                <Link
                  key={`cat-${cat._id ?? cat.slug}`}
                  href={`/c/${cat.slug}`}
                  className="mcg-card group min-w-[32%] max-w-[32%] shrink-0 h-[156px] rounded-md border border-gray-200 bg-white p-2 flex flex-col items-stretch justify-start hover:shadow-md hover:border-cyan-300 transition"
                  onClick={(e) => {
                    if (!cat.slug) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="mcg-img basis-[80%] rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                    <img
                      src={cat.image || "/placeholder.png"}
                      alt={cat.title}
                      style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <p className="basis-[20%] flex items-center justify-center text-[13px] font-extrabold text-gray-800 text-center px-1 leading-tight line-clamp-2">
                    {cat.title}
                  </p>
                </Link>
              ))}
          
          {/* See All Card */}
          {!loading && (
            <Link
              href="/categories"
              className="min-w-[32%] max-w-[32%] shrink-0 h-[156px] rounded-md border border-gray-200 bg-white p-2 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-6 h-6">
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
