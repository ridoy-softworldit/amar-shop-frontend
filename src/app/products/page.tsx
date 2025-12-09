/* eslint-disable @typescript-eslint/no-explicit-any */

import CategoryView from "@/components/category/CategoryView";
import ProductsGridClient from "@/components/product/ProductsGridClient";
import { fetchProducts, fetchCategories } from "@/services/catalog";
import type { Product, Category } from "@/types";
import { Grid3x3, Search } from "lucide-react";
import Link from "next/link";

export const revalidate = 30;

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; subcategory?: string; q?: string }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const { category, subcategory, q } = params;

  // If subcategory-only route -> show subcategory landing
  if (subcategory && !q) {
    return <CategoryView slug={decodeURIComponent(subcategory)} isSubcategory={true} />;
  }

  // If category-only route -> show category landing (existing behavior)
  if (category && !q) {
    return <CategoryView slug={decodeURIComponent(category)} />;
  }

  const initialLimit = 20;

  // server fetch first page only (unchanged)
  const [productsRes, categoriesRes] = await Promise.all([
    fetchProducts({
      page: 1,
      limit: initialLimit,
      category: category,
      q: q,
    }),
    fetchCategories(),
  ]);

  // --- Normalize server response shapes (keeps your existing logic intact)
  const rawData: any = productsRes?.data;
  let products: Product[] = [];
  const defaultMeta = {
    total: 0,
    page: 1,
    limit: initialLimit,
    pages: 1,
  };
  let initialMeta = { ...defaultMeta };

  if (Array.isArray(rawData)) {
    products = rawData as Product[];
    initialMeta = {
      total: products.length,
      page: 1,
      limit: products.length || initialLimit,
      pages: 1,
    };
  } else if (rawData && typeof rawData === "object") {
    const items = Array.isArray(rawData.items)
      ? (rawData.items as Product[])
      : [];
    products = items.length ? items : (rawData as Product[]);

    initialMeta = {
      total:
        typeof rawData.total === "number" ? rawData.total : products.length,
      page: typeof rawData.page === "number" ? rawData.page : 1,
      limit: typeof rawData.limit === "number" ? rawData.limit : initialLimit,
      pages:
        typeof rawData.pages === "number"
          ? rawData.pages
          : Math.max(
              1,
              Math.ceil(
                (rawData.total ?? products.length) /
                  (rawData.limit ?? initialLimit)
              )
            ),
    };
  } else {
    products = [];
    initialMeta = { total: 0, page: 1, limit: initialLimit, pages: 1 };
  }

  const categories: Category[] = categoriesRes?.data ?? [];
  const activeCategory = categories.find((c) => c.slug === category);

  // --- If no products, show friendly empty state (improved UI)
  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] bg-white">
        <div className="mx-auto max-w-7xl px-4 xs:px-5 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-50 rounded-full mb-6">
              <Search className="w-10 h-10 text-[#167389]" aria-hidden />
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
              No products found
            </h2>

            <p className="text-gray-600 max-w-xl mx-auto mb-6">
              {q ? (
                <>
                  No results for{" "}
                  <strong className="text-gray-800">{q}</strong>. Try
                  different keywords or browse categories.
                </>
              ) : (
                "We are adding new products regularly — check back soon or browse categories."
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#167389] text-white px-5 py-2.5 rounded-full shadow hover:bg-[#135a6b] transition"
                aria-label="View all products"
              >
                Browse all products
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition text-gray-700"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Normal case: show header + ProductsGridClient (unchanged API)
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 xs:px-5 sm:px-6 lg:px-8 py-16 md:py-12">
        {/* ====== Header: title, subtitle, controls (clean & accessible) ====== */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br from-[#167389] to-[#0f6b76] text-white shrink-0">
              <Grid3x3 className="w-6 h-6" aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 truncate">
                {activeCategory?.title ?? "All Products"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {initialMeta.total} fresh original products
              </p>
            </div>

            {/* quick actions: view as grid/list, search link (non-breaking - pure UI) */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-md text-sm text-gray-700 hover:shadow-sm transition"
                aria-label="Open search"
              >
                <Search className="w-4 h-4" />
                Search
              </Link>
            </div>
          </div>
        </div>

        {/* ====== Products grid client (responsible for rendering cards, pagination, filters) ====== */}
        <ProductsGridClient
          initialItems={products}
          initialMeta={initialMeta}
          category={category}
          q={q}
        />
      </div>
    </div>
  );
}
