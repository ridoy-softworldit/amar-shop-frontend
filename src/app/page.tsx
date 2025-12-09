/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CategoriesScroll from "@/components/home/CategoriesScroll";
import MobileCategoriesGrid from "@/components/home/MobileCategoriesGrid";
import { PromoCard, DesktopSidebar } from "../components";
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/services/catalog.api";
import ErrorBoundary from "@/components/home/ErrorBoundary";
import { useState, useEffect, useMemo } from "react";
import HeroBannerClient from "@/components/home/HeroBannerClient";
import { useIsMobile } from "@/hooks/useIsMobile";
import TrendingGrid from "@/components/home/TrendingGrid";
import ManufacturersSection from "@/components/home/ManufacturersSection";

import type { Product, Category } from "@/lib/schemas";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductSection from "@/components/home/ProductSection";

/**
 * Utility: normalize various response shapes into an array of items
 */
function extractItems<T = any>(res: unknown): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (typeof res !== "object") return [];
  const obj = res as Record<string, any>;

  if (Array.isArray(obj.items)) return obj.items as T[];
  if (Array.isArray(obj.data)) return obj.data as T[];
  if (obj.data && typeof obj.data === "object" && Array.isArray(obj.data.items))
    return obj.data.items as T[];

  const firstArr = Object.values(obj).find((v) => Array.isArray(v));
  if (Array.isArray(firstArr)) return firstArr as T[];

  return [];
}

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // APIs (RTK hooks)
  const { data: catRes, isLoading: catLoading } = useGetCategoriesQuery();
  const { data: hotRes, isLoading: hotLoading } = useGetProductsQuery({
    discounted: "true",
    limit: 16,
  });
  const { data: newRes, isLoading: newLoading } = useGetProductsQuery({
    limit: 16,
    sort: "new",
  });
  const { data: pickRes, isLoading: pickLoading } = useGetProductsQuery({
    limit: 16,
    tag: "featured",
  });

  const loading = catLoading || hotLoading || newLoading || pickLoading;

  // Normalize categories
  const categories: Category[] = Array.isArray(catRes)
    ? (catRes as Category[])
    : extractItems<Category>(catRes);

  // Normalize product sections with useMemo for performance
  const hotDealsAll = useMemo(() => extractItems<Product>(hotRes), [hotRes]);
  const newArrivalsAll = useMemo(() => extractItems<Product>(newRes), [newRes]);
  const editorsPicksAll = useMemo(
    () => extractItems<Product>(pickRes),
    [pickRes]
  );

  // Filter in-stock items with useMemo
  const filterInStock = useMemo(
    () => (arr: Product[]) =>
      arr.filter((p) => Number(p?.stock ?? p?.availableStock ?? 0) > 0),
    []
  );

  const hotDeals = useMemo(
    () => filterInStock(hotDealsAll).slice(0, 8),
    [hotDealsAll, filterInStock]
  );

  const newArrivals = useMemo(
    () => filterInStock(newArrivalsAll).slice(0, 8),
    [newArrivalsAll, filterInStock]
  );

  const editorsPicks = useMemo(
    () => filterInStock(editorsPicksAll).slice(0, 8),
    [editorsPicksAll, filterInStock]
  );

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1600px] mx-auto lg:px-5 py-3">
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto lg:px-5 py-3 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-3">
        {/* Left sidebar */}
        <div className="hidden lg:block">
          <ErrorBoundary>
            <DesktopSidebar categories={categories} loading={loading} />
          </ErrorBoundary>
        </div>

        {/* Main content */}
        <main className="space-y-3 lg:space-y-8">
          {/* ===== Banner + Promo ===== */}
          <div className="w-full">
            <div className="hidden lg:grid lg:grid-cols-[1fr_220px] gap-2 lg:h-[380px]">
              <div className="h-full">
                <HeroBannerClient limit={6} heightClass="h-full" />
              </div>
              <div className="flex flex-col gap-2 h-full">
                <PromoCard
                  href="/products?category=surgical"
                  className="flex-1"
                />
                <PromoCard
                  href="/products?category=medicine"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="lg:hidden flex flex-col gap-2 pt-12">
              <div className="w-full">
                <HeroBannerClient
                  limit={6}
                  heightClass="h-[120px] sm:h-[200px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 px-1">
                <PromoCard href="/products?category=surgical" />
                <PromoCard href="/products?category=medicine" />
              </div>
            </div>
          </div>


          {/* ===== Trending Products ===== */}
          <ErrorBoundary>
            <TrendingGrid
              title="📈 Trending Now"
              subtitle="Most popular products with amazing deals"
              products={hotDeals}
              className="-mt-4"
            />
          </ErrorBoundary>

          {/* ===== Manufacturers Section ===== */}
          <ErrorBoundary>
            <ManufacturersSection />
          </ErrorBoundary>

          {/* ===== Categories ===== */}
          <ErrorBoundary>
            {isMobile ? (
              <MobileCategoriesGrid categories={categories} loading={loading} />
            ) : (
              <CategoriesScroll categories={categories} />
            )}
          </ErrorBoundary>

          

      

          {/* ===== New Arrivals Section ===== */}
          <ErrorBoundary>
            <ProductSection
              title="🆕 New Arrivals"
              subtitle="Discover our latest products and fresh collections"
              href="/search?sort=new&availability=in_stock"
              products={newArrivals}
              loading={newLoading}
              variant="default"
              showViewAll={true}
            />
          </ErrorBoundary>

          {/* ===== Editor's Picks Section ===== */}
          <ErrorBoundary>
            <ProductSection
              title="⭐ Editor's Picks"
              subtitle="Handpicked by our experts for exceptional quality"
              href="/search?tag=featured&availability=in_stock"
              products={editorsPicks}
              loading={pickLoading}
              variant="default"
              showViewAll={true}
            />
          </ErrorBoundary>

          {/* ===== Additional Promotional Section ===== */}
          <ErrorBoundary>
            <section className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 mt-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Cant Find What You are Looking For?
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Explore our complete catalog with thousands of products
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r bg-[#167389] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:gap-4"
                >
                  Browse All Products
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </section>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
