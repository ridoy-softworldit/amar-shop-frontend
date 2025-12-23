/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

/**
 * Helper: normalize different backend response shapes into Product[]
 * Accepts:
 *  - array: [...]
 *  - { data: [...] } or { data: { items: [...] } }
 *  - { items: [...] } or { results: [...] }
 *  - { ok: true, data: { items: [...] } }
 */
function extractItemsFromResponse(res: any): Product[] {
  if (!res) return [];
  // direct array
  if (Array.isArray(res)) return res;
  // common patterns
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.results)) return res.results;
  // if server returns ok:true and data is array or object with items
  if (res.ok && Array.isArray(res.data)) return res.data;
  if (res.ok && res.data && Array.isArray(res.data.items))
    return res.data.items;
  // try to find first array value in object (fallback)
  const firstArr = Object.values(res).find((v) => Array.isArray(v));
  if (Array.isArray(firstArr)) return firstArr as Product[];
  return [];
}

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

type Props = {
  initialProducts: Product[] | any; // accept flexible shapes
  categorySlug?: string;
  subcategorySlug?: string;
};

export default function CategoryProducts({
  initialProducts,
  categorySlug,
  subcategorySlug,
}: Props) {
  const PAGE_SIZE = 8;

  // normalize initialProducts into array
  const normalizedInitial: Product[] =
    extractItemsFromResponse(initialProducts);

  const [items, setItems] = useState<Product[]>(normalizedInitial || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    (normalizedInitial?.length || 0) >= PAGE_SIZE
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if category/subcategory changed, reset list with normalized incoming data
    const arr = extractItemsFromResponse(initialProducts);
    setItems(arr);
    setHasMore((arr?.length || 0) >= PAGE_SIZE);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, subcategorySlug, JSON.stringify(initialProducts ?? null)]); // stringify to detect payload changes

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const page = Math.floor(items.length / PAGE_SIZE) + 1; // next page (1-based)
      const url = new URL(`${API}/products`);
      if (categorySlug) url.searchParams.set("category", categorySlug);
      if (subcategorySlug) url.searchParams.set("subcategory", subcategorySlug);
      url.searchParams.set("limit", String(PAGE_SIZE));
      url.searchParams.set("page", String(page + 1)); // because server pages are 1-based and we already have page items
      // Note: If your backend uses skip/limit instead of page/limit, change accordingly:
      // url.searchParams.set("skip", String(items.length));

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const json = await res.json().catch(() => ({}));
      const nextItems: Product[] = extractItemsFromResponse(json);

      if (!nextItems || nextItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((s) => [...s, ...nextItems]);
        // if returned < PAGE_SIZE then no more
        if (nextItems.length < PAGE_SIZE) setHasMore(false);
      }
    } catch (err: any) {
      console.error("loadMore error", err);
      setError("Failed to load more products");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((p) => (
            <div key={p._id} className="min-w-0">
              <ProductCard product={p} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            No products found
          </div>
        )}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex justify-center mt-4">
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-5 py-2.5 bg-[#167389] text-white rounded-xl shadow hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Loading..." : "View more"}
          </button>
        ) : (
          <div className="text-sm text-gray-500">No more products</div>
        )}
      </div>
    </div>
  );
}
