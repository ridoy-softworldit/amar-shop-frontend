"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRight,
} from "lucide-react";
import type { Category } from "@/lib/schemas";
import MobileCategoriesGrid from "./MobileCategoriesGrid";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  categories: Category[];
  loading?: boolean;
}

export default function CategoriesScroll({
  categories,
  loading = false,
}: Props) {
  const isMobile = useIsMobile(); // ✅ একটাই ব্র্যাঞ্চ মাউন্ট হবে

  // ---- Desktop scroll state/logic (unchanged) ----
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const skeletonItems = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i),
    []
  );
  const [inView, setInView] = useState(true);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrowState = () => {
    const el = trackRef.current;
    if (!el) return;
    const l = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(l > 4);
    setCanRight(l < max - 4);
  };

  const scrollByOne = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const item = el.querySelector(
      '[data-cat-card="1"]'
    ) as HTMLAnchorElement | null;
    const step = (item?.clientWidth || 120) + 12;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root: null, threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    updateArrowState();
    const onResize = () => updateArrowState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const id = setTimeout(updateArrowState, 0);
    return () => clearTimeout(id);
  }, [categories, loading]);

  return (
    <section
      ref={containerRef}
      className="cat-scroll relative rounded-xl border border-gray-200 bg-white shadow-sm p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#167389]" size={18} />
          <h2 className="text-base sm:text-lg font-semibold text-[#167389]">
            Shop by Categories
          </h2>
        </div>
        {!loading && (
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm text-[#167389] transition hover:text-rose-600"
          >
            View All <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* ✅ একটাই subtree */}
      {isMobile ? (
        <MobileCategoriesGrid categories={categories} loading={loading} />
      ) : (
        <div className="relative isolate overflow-hidden">
          {!loading && categories.length > 0 && (
            <>
              <button
                onClick={() => scrollByOne("left")}
                aria-label="Scroll Left"
                className={`cat-arrow absolute left-2 top-1/2 hidden -translate-y-1/2
                  h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white shadow
                  transition-opacity hover:bg-gray-100 active:scale-95 lg:flex ${
                    (!inView || !canLeft) && "pointer-events-none opacity-0"
                  }`}
              >
                <ChevronLeft className="text-[#167389]" size={18} />
              </button>

              <button
                onClick={() => scrollByOne("right")}
                aria-label="Scroll Right"
                className={`cat-arrow absolute right-2 top-1/2 hidden -translate-y-1/2
                  h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white shadow
                  transition-opacity hover:bg-gray-100 active:scale-95 lg:flex ${
                    (!inView || !canRight) && "pointer-events-none opacity-0"
                  }`}
              >
                <ChevronRight className="text-[#167389]" size={18} />
              </button>
            </>
          )}

          {/* Track */}
          <div
            ref={trackRef}
            className="cat-track scrollbar-hide relative -mx-2 overflow-x-auto px-2 scroll-smooth"
            style={{ overscrollBehaviorX: "contain" }}
            onScroll={updateArrowState}
          >
            <div className="min-w-max flex gap-3 pb-1">
              {(loading ? skeletonItems : categories).map((it, index) => {
                if (loading) {
                  return (
                    <div
                      key={`sk-${index}`}
                      className="w-[120px] md:w-[128px] lg:w-[132px]
                               h-[160px] md:h-[172px] lg:h-[180px]
                               shrink-0 rounded-xl border border-gray-200 bg-white p-2"
                    >
                      <div className="h-[120px] md:h-[130px] lg:h-[138px] w-full rounded-lg bg-gray-100 animate-pulse" />
                      <div className="mt-2 h-3 w-20 rounded bg-gray-100 animate-pulse" />
                    </div>
                  );
                }

                const cat = it as Category;
                return (
                  <Link
                    data-cat-card="1"
                    key={cat._id ?? cat.slug ?? `cat-${index}`}
                    href={`/c/${cat.slug}`}
                    className="w-[120px] md:w-[128px] lg:w-[132px]
                               h-[160px] md:h-[172px] lg:h-[180px]
                               shrink-0 rounded-xl border border-gray-200 bg-white
                               transition hover:border-cyan-300 hover:shadow"
                  >
                    <div className="relative mx-2 mt-2 h-[120px] md:h-[130px] lg:h-[138px] overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center p-1">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.title}
                          style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
                        />
                      ) : (
                        <ShoppingBag className="text-[#167389]" size={24} />
                      )}
                    </div>
                    <p className="px-2 pb-2 pt-1 text-center text-[12px] font-semibold leading-tight text-gray-700 line-clamp-2">
                      {cat.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {!loading && categories.length > 0 && (
            <>
              <div className="cat-fade-left pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
              <div className="cat-fade-right pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
            </>
          )}
        </div>
      )}
    </section>
  );
}
