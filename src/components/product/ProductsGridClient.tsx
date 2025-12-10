/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProductsGridClient.tsx
"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { fetchProducts } from "@/services/catalog";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";
import { useConfirmOrderMutation } from "@/services/catalog.api"; // adjust if needed

interface Meta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface Props {
  initialItems: any[];
  initialMeta: Meta;
  category?: string | null;
  q?: string | null;
}

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#f8fafc'/><text x='50%' y='50%' text-anchor='middle' fill='#ec4899' font-size='20' font-family='Arial'>No image</text></svg>`
  );

export default function ProductsGridClient({
  initialItems,
  initialMeta,
  category,
  q,
}: Props) {
  const [items, setItems] = useState<Product[]>(initialItems ?? []);
  const [meta, setMeta] = useState<Meta>(
    initialMeta ?? { total: 0, page: 1, limit: 20, pages: 1 }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allLoaded = items.length >= meta.total;

  async function loadMore() {
    if (loading || allLoaded) return;
    setLoading(true);
    setError(null);

    const nextPage = meta.page + 1;

    try {
      const res = await fetchProducts({
        page: nextPage,
        limit: meta.limit,
        category: category ?? undefined,
        q: q ?? undefined,
      });

      if (!res || !res.ok) throw new Error("Bad response from API");

      const newItems = Array.isArray(res.data.items)
        ? (res.data.items as Product[])
        : [];
      const newMeta: Meta = {
        total: Number(res.data.total ?? meta.total),
        page: Number(res.data.page ?? nextPage),
        limit: Number(res.data.limit ?? meta.limit),
        pages: Number(res.data.pages ?? meta.pages),
      };

      setItems((prev) => {
        const ids = new Set(prev.map((p) => p._id));
        const merged = [...prev];
        for (const it of newItems) {
          if (!ids.has(it._id)) {
            merged.push(it);
            ids.add(it._id);
          }
        }
        return merged;
      });

      setMeta(newMeta);
    } catch (err: any) {
      console.error("Load more error", err);
      setError("Unable to load more products. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------ Mobile list state (qty + loading per product) ------------------
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [localStockDelta, setLocalStockDelta] = useState<
    Record<string, number>
  >({});
  const [confirmOrder] = useConfirmOrderMutation();
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s: any) =>
    s.removeItem ? s.removeItem : () => {}
  );

  // initialize quantities for visible items whenever items change
  useEffect(() => {
    if (!items?.length) return;
    setQuantities((prev) => {
      const next = { ...prev };
      let changed = false;
      items.forEach((p) => {
        if (!(p._id in next)) {
          next[p._id] = 1;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [items]);

  // helper: compute available stock similar to TrendingGrid (server stock minus reserved in cart + optimistic delta)
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of items) {
      const totalStock = Math.max(0, Number(p.stock ?? p.availableStock ?? 0));
      const reserved =
        cartItems.find((c) => String(c._id) === String(p._id))?.quantity || 0;
      const delta = localStockDelta[p._id] ?? 0;
      map[p._id] = Math.max(0, totalStock + delta - reserved);
    }
    return map;
  }, [items, cartItems, localStockDelta]);

  const setLoadingOn = useCallback((id: string) => {
    setLoadingStates((s) => ({ ...s, [id]: true }));
  }, []);
  const setLoadingOff = useCallback((id: string) => {
    setLoadingStates((s) => {
      const n = { ...s };
      delete n[id];
      return n;
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, newQty: number) => {
      setQuantities((prev) => {
        const maxAllowed = Math.max(1, stockMap[productId] ?? 1);
        const safe = Math.max(1, Math.min(newQty, maxAllowed));
        if (prev[productId] === safe) return prev;
        return { ...prev, [productId]: safe };
      });
    },
    [stockMap]
  );

  const incrementQuantity = useCallback(
    (productId: string) => {
      setQuantities((prev) => {
        const cur = prev[productId] ?? 1;
        const maxAllowed = Math.max(1, stockMap[productId] ?? 1);
        const next = Math.min(cur + 1, maxAllowed);
        return { ...prev, [productId]: next };
      });
    },
    [stockMap]
  );

  const decrementQuantity = useCallback((productId: string) => {
    setQuantities((prev) => {
      const cur = prev[productId] ?? 1;
      const next = Math.max(1, cur - 1);
      return { ...prev, [productId]: next };
    });
  }, []);

  // ------------------ Mobile handlers: Add to Bag & Buy now (reuse trending logic) ------------------
  const handleAddToCart = useCallback(
    async (p: Product) => {
      const id = p._id;
      const qty = quantities[id] ?? 1;
      const stock = Math.max(0, Number(p.stock ?? p.availableStock ?? 0));

      if (qty <= 0) {
        toast.error("Please select a valid quantity");
        return;
      }
      if (qty > stock) {
        toast.error(`Only ${stock} items available in stock`);
        return;
      }
      if (loadingStates[id]) return;

      try {
        setLoadingOn(id);
        addItem({
          _id: id,
          title: p.title,
          slug: p.slug ?? "",
          price: Number(p.price ?? 0),
          image:
            p.image ??
            (Array.isArray(p.image) ? (p.image as any)[0] : undefined) ??
            FALLBACK_IMG,
          quantity: qty,
        });

        toast.success(`${qty} × ${p.title} added to cart`);
        // reset qty
        setQuantities((prev) => ({ ...prev, [id]: 1 }));
      } catch (err) {
        console.error("Add to Bag failed", err);
        toast.error("Failed to Add to Bag. Please try again.");
      } finally {
        setTimeout(() => setLoadingOff(id), 200);
      }
    },
    [addItem, loadingStates, quantities, setLoadingOff, setLoadingOn]
  );

  const handleBuyNow = useCallback(
    async (p: Product) => {
      const id = p._id;
      const qty = quantities[id] ?? 1;
      const stock = Math.max(0, Number(p.stock ?? p.availableStock ?? 0));

      if (qty <= 0) {
        toast.error("Please select a valid quantity");
        return;
      }
      if (qty > stock) {
        toast.error(`Only ${stock} items available in stock`);
        return;
      }
      if (loadingStates[id]) return;

      try {
        setLoadingOn(id);

        addItem({
          _id: id,
          title: p.title,
          slug: p.slug ?? "",
          price: Number(p.price ?? 0),
          image:
            p.image ??
            (Array.isArray(p.image) ? (p.image as any)[0] : undefined) ??
            FALLBACK_IMG,
          quantity: qty,
        });

        // confirm order with server (mutation)
        const payload = { items: [{ _id: id, quantity: qty }] };
        const response = await confirmOrder(payload).unwrap();

        if (response?.ok) {
          try {
            (removeItem as any)(id);
          } catch (e) {
            /* ignore if removeItem not present */
          }

          // optimistic local stock delta (optional)
          setLocalStockDelta((prev) => ({
            ...prev,
            [id]: (prev[id] ?? 0) - qty,
          }));

          setQuantities((prev) => ({ ...prev, [id]: 1 }));
          toast.success("Redirecting to checkout...");
          if (typeof window !== "undefined") window.location.href = "/checkout";
        } else {
          toast.error("Failed to process order");
        }
      } catch (err: any) {
        console.error("Buy Now failed:", err);
        if (err?.data?.code === "INSUFFICIENT_STOCK" || err?.status === 409) {
          toast.error("Insufficient stock to place order");
        } else {
          toast.error("Could not place order. Please try again.");
        }
      } finally {
        setLoadingOff(id);
      }
    },
    [
      addItem,
      confirmOrder,
      loadingStates,
      quantities,
      removeItem,
      setLoadingOff,
      setLoadingOn,
    ]
  );

  // ------------------ Helpers ------------------
  const calcDiscount = useCallback((price?: number, compare?: number) => {
    const p = Number(price ?? 0);
    const c = Number(compare ?? 0);
    if (c > p && p > 0) return Math.round(((c - p) / c) * 100);
    return 0;
  }, []);

  // ------------------ Rendering ------------------
  return (
    <div>
      {/* ---------- MOBILE: list rows with image-left, badges outside image, title bottom-left, stock bottom-right ---------- */}
      <div className="lg:hidden space-y-3">
        {items.map((p) => {
          const cover =
            (p.image && p.image.trim()) ||
            (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '') ||
            FALLBACK_IMG;
          const showCompare =
            p.compareAtPrice != null &&
            p.price != null &&
            Number(p.compareAtPrice) > Number(p.price);
          const discount = calcDiscount(
            Number(p.price ?? 0),
            Number(p.compareAtPrice ?? 0)
          );
          const qty = quantities[p._id] ?? 1;
          const loadingState = !!loadingStates[p._id];
          const stock = Math.max(0, Number(p.stock ?? p.availableStock ?? 0));
          const reserved =
            cartItems.find((c) => String(c._id) === String(p._id))?.quantity ||
            0;
          const available = Math.max(
            0,
            stock + (localStockDelta[p._id] ?? 0) - reserved
          );

          return (
            <div
              key={p._id}
              className="bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm p-2 flex items-center gap-2"
            >
              {/* LEFT: image + discount badge */}
              <div className="w-24 shrink-0">
                <div className="mb-1">
                  {discount > 0 && (
                    <span className="inline-block bg-pink-50 text-pink-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {discount}%
                    </span>
                  )}
                </div>
                <Link
                  href={`/products/${encodeURIComponent(p.slug ?? p._id)}`}
                  aria-label={`View ${p.title}`}
                  className="relative h-24 w-24 rounded-md overflow-hidden bg-white border flex items-center justify-center block"
                >
                  <Image
                    src={cover}
                    alt={p.title}
                    fill
                    sizes="96px"
                    className="object-contain"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </Link>
              </div>

              {/* CENTER: title, price, delivery */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1 line-clamp-1">
                  {p.brand ?? p.manufacturer ?? ""}
                </div>

                <Link
                  href={`/products/${encodeURIComponent(p.slug ?? p._id)}`}
                  className="block"
                >
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {p.title}
                  </h3>
                </Link>

                <div className="mt-2">
                  <div className="text-lg font-bold text-gray-900">
                    ৳{Number(p.price).toLocaleString()}
                  </div>
                  {showCompare && (
                    <div className="text-xs text-gray-400 line-through">
                      ৳{Number(p.compareAtPrice).toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    🕘 Est. delivery
                  </div>
                </div>
              </div>

              {/* RIGHT: qty + actions */}
              <div className="w-28 shrink-0 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-gray-700 font-medium mb-1">
                    Qty
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                    <button
                      onClick={() => decrementQuantity(p._id)}
                      disabled={loadingState || qty <= 1}
                      className="w-6 h-6 rounded-md bg-white text-black border flex items-center justify-center disabled:opacity-50"
                      aria-label={`Decrease quantity for ${p.title}`}
                    >
                      −
                    </button>

                    <div className="flex-1 text-black text-center font-bold">
                      {qty}
                    </div>

                    <button
                      onClick={() => incrementQuantity(p._id)}
                      disabled={loadingState || qty >= Math.max(1, stock)}
                      className="w-6 h-6 rounded-md bg-white text-black border flex items-center justify-center disabled:opacity-50"
                      aria-label={`Increase quantity for ${p.title}`}
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-1">
                    <div className="text-sm text-black font-semibold">
                      ৳{((Number(p.price) || 0) * qty).toLocaleString()}
                    </div>
                    {showCompare && (
                      <div className="text-xs text-gray-500 line-through">
                        ৳{(Number(p.compareAtPrice) || 0).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 my-1">
                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={available <= 0 || loadingState}
                    className="w-full px-1 py-1 bg-[#167389] text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingState ? "Adding..." : "Add to Bag"}
                  </button>

                  <button
                    onClick={() => handleBuyNow(p)}
                    disabled={available <= 0 || loadingState}
                    className="w-full px-2 py-1 bg-linear-to-r from-pink-600 to-rose-600 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingState ? "Processing..." : "Buy Now"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- DESKTOP GRID: unchanged ---------- */}
      <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {items.map((product) => (
          <div key={product._id} className="min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* ---------- Load More / Footer ---------- */}
      <div className="mt-8 flex items-center justify-center">
        {error && <div className="text-sm text-red-600 mb-2 mr-4">{error}</div>}

        {!allLoaded ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#167389] text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            aria-label="Load more products"
          >
            {loading ? "Loading..." : "View more"}
          </button>
        ) : (
          <div className="text-sm text-gray-600">All products loaded</div>
        )}
      </div>
    </div>
  );
}
