/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

/**
 * Helper: normalize different backend response shapes into Product[]
 */
function extractItemsFromResponse(res: any): Product[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.results)) return res.results;
  if (res.ok && Array.isArray(res.data)) return res.data;
  if (res.ok && res.data && Array.isArray(res.data.items))
    return res.data.items;
  const firstArr = Object.values(res).find((v) => Array.isArray(v));
  if (Array.isArray(firstArr)) return firstArr as Product[];
  return [];
}

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

type Props = {
  initialProducts: Product[] | any;
  manufacturerSlug: string;
  brandName?: string;
};

export default function ManufacturerProducts({
  initialProducts,
  manufacturerSlug,
  brandName,
}: Props) {
  const PAGE_SIZE = 8;

  const normalizedInitial: Product[] =
    extractItemsFromResponse(initialProducts);

  const [items, setItems] = useState<Product[]>(normalizedInitial || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    (normalizedInitial?.length || 0) >= PAGE_SIZE
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const arr = extractItemsFromResponse(initialProducts);
    setItems(arr);
    setHasMore((arr?.length || 0) >= PAGE_SIZE);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturerSlug, JSON.stringify(initialProducts ?? null)]);

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const page = Math.floor(items.length / PAGE_SIZE) + 1;
      const url = new URL(`${API}/products`);
      const actualBrandName = brandName || manufacturerSlug.replace(/-/g, ' ');
      url.searchParams.set("brand", actualBrandName);
      url.searchParams.set("limit", String(PAGE_SIZE));
      url.searchParams.set("page", String(page));

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const json = await res.json().catch(() => ({}));
      const nextItems: Product[] = extractItemsFromResponse(json);

      if (!nextItems || nextItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((s) => [...s, ...nextItems]);
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
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-wrap gap-2">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))
        ) : (
          <div className="w-full text-center text-gray-500 py-8">
            No products found
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.isArray(items) && items.length > 0 ? (
          items.map((p) => (
            <ProductCard key={p._id} product={p} />
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