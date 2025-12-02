/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProductShelf.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import { useGetProductsQuery } from "@/services/catalog.api";
import type { ProductsQuery } from "@/services/catalog";
import type { Product } from "@/lib/schemas";
import Link from "next/link";

/**
 * Shelf that keeps local copy of items and updates them when ProductCard reports stock changes.
 */
export default function ProductShelf({
  title,
  query = {},
  gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
}: {
  title: string;
  query?: Partial<ProductsQuery>;
  gridCols?: string;
}) {
  const { data, isLoading, error } = useGetProductsQuery(query as any);

  // normalize data: accept boxed { items, ... } or direct array
  const incomingItems: Product[] = Array.isArray(data?.items)
    ? (data as any).items
    : Array.isArray(data)
      ? (data as Product[])
      : [];

  // local state so we can mutate (optimistic) and remove out-of-stock
  const [items, setItems] = useState<Product[]>(() => incomingItems ?? []);

  // sync upstream changes (e.g., refetch) — keep items in sync but preserve local optimistic changes if IDs match
  useEffect(() => {
    // if initial empty and incoming non-empty OR length differs significantly, replace
    setItems((prev) => {
      // if identical references or both empty, keep prev
      if (!incomingItems) return prev;
      // quick heuristic: if prev empty and incoming non-empty -> replace
      if (prev.length === 0 && incomingItems.length > 0) return incomingItems;
      // otherwise merge: prefer prev entries where same id exists (to preserve localStock)
      const prevById = new Map(prev.map((p) => [String(p._id), p]));
      const merged = incomingItems.map((p) => prevById.get(String(p._id)) ?? p);
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(incomingItems?.map((i) => String(i._id)))]);
  // note: stringify-deps used as light key-based sync to avoid deep equality libs

  // callback to receive local stock changes from child cards
  const handleLocalStockChange = useCallback((id: string, newStock: number) => {
    setItems((prev) => {
      // if newStock <= 0 remove the product
      if (newStock <= 0) {
        return prev.filter((p) => String(p._id) !== String(id));
      }
      // else update stock on that product
      return prev.map((p) =>
        String(p._id) === String(id)
          ? { ...p, availableStock: newStock, stock: newStock }
          : p
      );
    });
  }, []);

  // Visible (in-stock)
  const visible = items.filter(
    (p) => Number(p?.availableStock ?? p?.stock ?? 0) > 0
  );

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h3>
        {visible.length > 0 && (
          <Link
            href="/products"
            className="text-sm text-cyan-600 hover:text-cyan-800 font-semibold"
          >
            View all →
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600">Failed to load {title}</p>}

      {!isLoading && !error && visible.length === 0 && (
        <p className="text-gray-500">No products available</p>
      )}

      {!isLoading && !error && visible.length > 0 && (
        <div
          className={`grid gap-3 sm:gap-4 md:gap-5 ${gridCols}`}
          aria-label={title}
        >
          {visible.map((p) => (
            <ProductCard
              key={String(p._id)}
              product={p}
              onLocalStockChange={handleLocalStockChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
