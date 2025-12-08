/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";
import { useConfirmOrderMutation } from "@/services/catalog.api";
import type { Product } from "@/lib/schemas"; // your ZProduct -> Product type

const DEFAULT_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#f8fafc'/><text x='50%' y='50%' text-anchor='middle' fill='#ec4899' font-size='20' font-family='Arial'>No image</text></svg>`
  );

const formatPrice = (v: number) => `৳${Number(v || 0).toLocaleString("en-BD")}`;

function getCover(p: Product) {
  return (
    p.image ??
    (Array.isArray((p as any).images) ? (p as any).images[0] : undefined) ??
    DEFAULT_IMG
  );
}

// lightweight ProductImage (same behavior: safe fallback + object-contain)
function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [localSrc, setLocalSrc] = useState(src || DEFAULT_IMG);
  useEffect(() => setLocalSrc(src || DEFAULT_IMG), [src]);

  return (
    // next/image with fill needs parent position relative; caller ensures this
    <Image
      src={localSrc}
      alt={alt}
      fill
      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
      className={className}
      onError={() => setLocalSrc(DEFAULT_IMG)}
      unoptimized={localSrc.startsWith("data:")}
      priority={false}
    />
  );
}

type Props = {
  items: Product[]; // pass server-fetched items from LatestGrid
  showCount?: number; // how many mobile cards to show (default 2 or 4)
};

export default function NewArrivalsMobile({ items, showCount = 2 }: Props) {
  const router = useRouter();
  const visible = items?.slice(0, showCount) ?? [];

  // cart store
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s: any) =>
    s.removeItem ? s.removeItem : () => {}
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [confirmOrder] = useConfirmOrderMutation();

  useEffect(() => {
    const init: Record<string, number> = {};
    visible.forEach((p) => (init[p._id] = 1));
    setQuantities((prev) => ({ ...init, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const setLoadingOn = useCallback(
    (id: string) => setLoadingStates((s) => ({ ...s, [id]: true })),
    []
  );
  const setLoadingOff = useCallback(
    (id: string) =>
      setLoadingStates((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      }),
    []
  );

  const incrementQuantity = useCallback((id: string, max = 1) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(max, (prev[id] || 1) + 1),
    }));
  }, []);

  const decrementQuantity = useCallback((id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  }, []);

  const handleAddToCart = useCallback(
    async (prod: Product) => {
      const id = prod._id;
      const qty = quantities[id] ?? 1;
      const stock = Math.max(0, Number(prod.stock ?? 0));
      if (qty <= 0) {
        toast.error("Please select a valid quantity");
        return;
      }
      if (qty > stock) {
        toast.error(`Only ${stock} items available`);
        return;
      }
      if (loadingStates[id]) return;
      try {
        setLoadingOn(id);
        addItem({
          _id: prod._id,
          title: prod.title,
          slug: prod.slug ?? "",
          price: Number(prod.price ?? 0),
          image: getCover(prod),
          quantity: qty,
        });
        toast.success(`${qty} × ${prod.title} added to cart`);
        setQuantities((prev) => ({ ...prev, [id]: 1 }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to Add to Bag");
      } finally {
        setTimeout(() => setLoadingOff(id), 200);
      }
    },
    [addItem, loadingStates, quantities, setLoadingOff, setLoadingOn]
  );

  const handleBuyNow = useCallback(
    async (prod: Product) => {
      const id = prod._id;
      const qty = quantities[id] ?? 1;
      const stock = Math.max(0, Number(prod.stock ?? 0));
      if (qty <= 0) {
        toast.error("Please select a valid quantity");
        return;
      }
      if (qty > stock) {
        toast.error(`Only ${stock} items available`);
        return;
      }
      if (loadingStates[id]) return;

      try {
        setLoadingOn(id);
        // Add to Bag to reserve
        addItem({
          _id: prod._id,
          title: prod.title,
          slug: prod.slug ?? "",
          price: Number(prod.price ?? 0),
          image: getCover(prod),
          quantity: qty,
        });

        const payload = { items: [{ _id: prod._id, quantity: qty }] };
        const res = await confirmOrder(payload).unwrap();

        if (res?.ok) {
          // remove to avoid duplication if remove exists
          try {
            (removeItem as any)(prod._id);
          } catch (_) {}
          toast.success("Redirecting to checkout...");
          router.push("/checkout");
        } else {
          toast.error("Failed to process order");
        }
      } catch (err: any) {
        console.error("BuyNow error", err);
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
      removeItem,
      quantities,
      router,
      setLoadingOff,
      setLoadingOn,
    ]
  );

  return (
    <div className="lg:hidden space-y-2">
      {visible.map((prod) => {
        const cover = getCover(prod);
        const stock = Math.max(0, Number(prod.stock ?? 0));
        const qty = quantities[prod._id] ?? 1;
        const loading = !!loadingStates[prod._id];
        const showCompare =
          prod.compareAtPrice != null &&
          prod.price != null &&
          Number(prod.compareAtPrice) > Number(prod.price);
        const discount = showCompare
          ? Math.round(
              ((Number(prod.compareAtPrice) - Number(prod.price)) /
                Number(prod.compareAtPrice)) *
                100
            )
          : 0;

        return (
          <div
            key={prod._id}
            className="bg-white h-auto rounded-md overflow-hidden border border-gray-200 shadow-sm p-2 flex gap-2"
          >
            <div className="w-2/3">
              <div className="mb-1">
                {discount > 0 && (
                  <span className="bg-pink-600 text-white px-2 py-1 rounded-full text-xs">
                    {discount}% OFF
                  </span>
                )}
              </div>

              <div className="relative h-20 rounded-md overflow-hidden border flex items-center justify-center">
                <Link href={`/products/${prod.slug}`}>
                  <a aria-label={`View ${prod.title}`}>
                    <ProductImage
                      src={cover}
                      alt={prod.title}
                      className="object-contain"
                    />
                  </a>
                </Link>
              </div>

              <div className="mt-2">
                <h3 className="text-xs font-semibold line-clamp-2 text-black mb-1">
                  {prod.title}
                </h3>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <div className="text-sm text-black font-bold">
                      {formatPrice(Number(prod.price ?? 0) * qty)}
                    </div>
                    {discount > 0 && (
                      <div className="text-[10px] text-gray-500 line-through">
                        {formatPrice(Number(prod.compareAtPrice ?? 0) * qty)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 bg-gray-200 rounded px-1 py-0.5">
                    <button
                      onClick={() => decrementQuantity(prod._id)}
                      disabled={loading || qty <= 1}
                      className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-black">{qty}</span>
                    <button
                      onClick={() => incrementQuantity(prod._id, Math.max(1, stock))}
                      disabled={loading || qty >= Math.max(1, stock)}
                      className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/3 flex flex-col justify-between">
              <div>
                <div
                  className={`text-xs px-2 py-1 rounded-md font-medium text-center ${stock === 0 ? "bg-red-100 text-red-800" : "bg-black/70 text-white"}`}
                >
                  {stock === 0 ? "Out" : `Stock: ${stock}`}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleAddToCart(prod)}
                  disabled={stock === 0 || loading}
                  className="w-full px-1 py-1 bg-[#167389] text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding..." : "Add to Bag"}
                </button>

                <button
                  onClick={() => handleBuyNow(prod)}
                  disabled={stock === 0 || loading}
                  className="w-full px-2 py-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Buy Now"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
