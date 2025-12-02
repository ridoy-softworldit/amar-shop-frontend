"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ManufacturerBanner, useGetManufacturerBannersQuery } from "@/store/promocardApi";

/**
 * ManufacturerBannerSlider
 * - Uses RTK Query's useGetManufacturerBannersQuery for caching & network efficiency
 * - Mobile: horizontal snap scroll (touch + keyboard friendly)
 * - Desktop: visible row with prev/next controls (scroll by card width)
 * - Accessible: buttons have aria labels; images have alt text
 */

function SkeletonCard() {
  return (
    <div className="w-[220px] h-28 sm:w-[260px] sm:h-32 rounded-xl bg-gray-100 animate-pulse" />
  );
}

export default function ManufacturerBannerSlider({
  limit = 8,
  className = "",
}: {
  limit?: number;
  className?: string;
}) {
  const { data, isLoading, isError } =
    useGetManufacturerBannersQuery(undefined);
  const banners = (data ?? []).slice(0, limit) as ManufacturerBanner[]; // type from API
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Update nav availability
  const updateNavState = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    updateNavState();
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => updateNavState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateNavState);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateNavState);
    };
  }, [updateNavState]);

  const scrollByOne = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    // scroll by container width (desktop) or card width (mobile)
    const cardApprox =
      el.querySelector<HTMLElement>("div[data-card]")?.clientWidth ?? 240;
    const amount = Math.max(el.clientWidth * 0.7, cardApprox + 16);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // keyboard navigation (left/right) when container focused
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        scrollByOne("left");
      } else if (e.key === "ArrowRight") {
        scrollByOne("right");
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, []);

  return (
    <section className={`w-full ${className}`}>
      <div className="max-w-[1600px] mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Manufacturers</h3>
          <p className="text-sm text-gray-500">Trusted brands we work with</p>
        </div>

        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-sm text-red-600">Failed to load banners.</div>
        ) : banners.length === 0 ? (
          <div className="text-sm text-gray-500">
            No manufacturer banners found.
          </div>
        ) : (
          <div className="relative">
            {/* Prev button - desktop only */}
            <button
              onClick={() => scrollByOne("left")}
              aria-label="Scroll left"
              className={`hidden md:inline-flex absolute left-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white border shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition ${
                canScrollLeft ? "opacity-100" : "opacity-40 pointer-events-none"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={containerRef}
              tabIndex={0}
              role="list"
              aria-label="Manufacturer banners"
              className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 px-1 md:px-6"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {banners.map((b) => (
                <div
                  data-card
                  role="listitem"
                  key={b._id}
                  className="snap-start flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] h-24 sm:h-28 rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition"
                >
                  <Link
                    href={b.link ?? "#"}
                    aria-label={`Go to ${b.manufacturer?.name ?? "manufacturer"}`}
                    className="block w-full h-full relative"
                  >
                    <Image
                      src={b.image || "/images/placeholder.png"}
                      alt={b.manufacturer?.name ?? "Manufacturer"}
                      fill
                      sizes="(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 260px"
                      className="object-cover"
                      priority={false}
                    />
                  </Link>
                </div>
              ))}
            </div>

            {/* Next button - desktop only */}
            <button
              onClick={() => scrollByOne("right")}
              aria-label="Scroll right"
              className={`hidden md:inline-flex absolute right-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-10 h-10 rounded-full bg-white border shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 transition ${
                canScrollRight
                  ? "opacity-100"
                  : "opacity-40 pointer-events-none"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
