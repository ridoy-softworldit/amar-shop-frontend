/* src/components/ProductSection.tsx */
"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AppProduct } from "@/types/product";
import ProductCard from "../ProductCard";


interface ProductSectionProps {
  title: string;
  subtitle?: string;
  href: string;
  products: AppProduct[];
  loading?: boolean;
  variant?: "default" | "compact";
  showViewAll?: boolean;
}

export default function ProductSection({
  title,
  subtitle,
  href,
  products,
  loading = false,
  variant = "default",
  showViewAll = true,
}: ProductSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || !scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          const cardWidth = scrollContainer.offsetWidth * 0.48 + 12;
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
  }, [mounted, products.length]);
  // Loading skeleton
  if (loading) {
    return (
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 rounded-2xl animate-pulse aspect-[3/4]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products?.length) {
    return null;
  }

  return (
    <section className="py-3 lg:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex sm:flex-row sm:items-end sm:justify-between gap-2 lg:gap-4 mb-3 lg:mb-8">
          <div className="flex-1">
            <h2 className="text-base lg:text-3xl font-bold text-[#167389] mb-1 lg:mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs lg:text-lg text-gray-600 max-w-2xl line-clamp-2 font-extralight">{subtitle}</p>
            )}
          </div>

          {showViewAll && (
            <Link
              href={href}
              className="inline-flex items-center gap-1 lg:gap-2 px-2 py-1.5 lg:px-3 lg:py-2 bg-gradient-to-r bg-[#167389] text-white rounded-md text-xs lg:text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:gap-2 lg:hover:gap-3 group whitespace-nowrap"
            >
              View All
              <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div ref={scrollRef} className="lg:hidden overflow-x-auto scrollbar-hide scroll-smooth">
          <div className="flex gap-3 pb-2">
            {products.map((product, index) => (
              <ProductCard
                key={product._id || `product-${index}`}
                product={product}
                variant={variant}
                compact={variant === "compact"}
                showDiscount={true}
                isMobileScroll={true}
              />
            ))}
            
            {/* See All Card */}
            <Link
              href={href}
              className="bg-white min-w-[48%] max-w-[48%] flex-shrink-0 rounded-md border border-gray-200 shadow-sm p-2 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700">See all</span>
            </Link>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product._id || `product-${index}`}
              product={product}
              variant={variant}
              compact={variant === "compact"}
              showDiscount={true}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        {showViewAll && (
          <div className="flex justify-center mt-8 lg:hidden">
            <Link
              href={href}
              className="w-full max-w-sm px-6 py-3 bg-cyan-700 text-white rounded-xl font-semibold text-center hover:bg-gray-800 transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}