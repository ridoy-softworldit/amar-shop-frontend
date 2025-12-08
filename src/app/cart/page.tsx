/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useDeliveryCharge } from "@/hooks/useDeliveryCharge";

// helpers
const toNum = (v: unknown, f = 0) =>
  Number.isFinite(Number(v)) ? Number(v) : f;
const money = (n: number) => `৳${toNum(n).toFixed(2)}`;
const getStock = (it: any): number => {
  const s =
    toNum(it?.stock, NaN) ??
    toNum((it as any)?.availableQty, NaN) ??
    toNum((it as any)?.stockQty, NaN);
  return Number.isFinite(s) ? s : Infinity;
};

export default function CartPage() {
  // store selectors (keep unchanged)
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  // UI local state
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // memoized total - force recalculation when items change
  const totalNumber = useMemo(() => {
    try {
      const val = getTotalPrice();
      return Number.isFinite(Number(val)) ? Number(val) : 0;
    } catch {
      return 0;
    }
  }, [getTotalPrice, items]);

  // Fetch delivery charge directly with totalNumber
  const { deliveryInfo, loading: deliveryLoading } = useDeliveryCharge(totalNumber);
  const deliveryCharge = deliveryInfo?.deliveryCharge || 0;
  const isFreeDelivery = deliveryInfo?.isFree || false;
  const amountNeeded = deliveryInfo ? Math.max(0, deliveryInfo.freeDeliveryThreshold - totalNumber) : 0;
  const grandTotal = totalNumber + deliveryCharge;

  const total = useMemo(() => money(totalNumber), [totalNumber]);

  // small helper to safely update qty with UI feedback
  const safeUpdateQuantity = useCallback(
    async (id: string, next: number) => {
      // guard
      setLoadingId(id);
      try {
        updateQuantity(id, next);
      } catch (e) {
        console.error("updateQuantity failed", e);
      } finally {
        // small delay to keep UX smooth
        setTimeout(() => setLoadingId((cur) => (cur === id ? null : cur)), 150);
      }
    },
    [updateQuantity]
  );

  // Summary panel component - FIXED: moved to top level before any conditional returns
  const SummaryPanel = useCallback(
    ({ compact = false }: { compact?: boolean }) => (
      <div
        className={`bg-white rounded-2xl border border-cyan-100 ${
          compact ? "p-3" : "p-5 sm:p-6"
        } shadow-md sm:shadow-lg text-sm sm:text-base`}
      >
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-cyan-600" />
          Order Summary
        </h2>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal ({items.length} items)</span>
            <span className="font-semibold">{total}</span>
          </div>

          <div className="flex justify-between text-gray-700">
            <span>Delivery</span>
            <span>
              {deliveryLoading ? (
                <span className="text-gray-400 text-sm">Calculating...</span>
              ) : isFreeDelivery ? (
                <span className="font-semibold text-green-600">FREE</span>
              ) : (
                <span className="font-semibold">{money(deliveryCharge)}</span>
              )}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-base sm:text-lg font-semibold text-gray-800">
              Grand Total
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#167389]">
              {money(grandTotal)}
            </span>
          </div>
        </div>

        {/* Free Delivery Badge */}
        {!isFreeDelivery && amountNeeded > 0 && (
          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-2.5">
            <p className="text-xs sm:text-sm text-orange-700">
              💡 Add <span className="font-semibold">{money(amountNeeded)}</span> more for FREE delivery!
            </p>
          </div>
        )}
        {isFreeDelivery && deliveryCharge === 0 && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2.5">
            <p className="text-xs sm:text-sm text-green-700 font-semibold">
              ✓ You qualify for FREE delivery!
            </p>
          </div>
        )}

        <Link href="/checkout" className="block mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-linear-to-r from-[#167389] to-[#167389] text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            aria-label="Proceed to checkout"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </Link>

        <button
          onClick={clearCart}
          className="hidden lg:flex w-full items-center justify-center gap-2 mt-4 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium text-sm sm:text-base"
          aria-label="Clear all items"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>
    ),
    [items.length, total, isFreeDelivery, deliveryCharge, grandTotal, amountNeeded, clearCart]
  );

  // empty cart view - NOW this comes after all hooks
  if (!items || items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center bg-white text-center px-4 sm:px-6 py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-cyan-50 rounded-full mb-6">
          <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-[#167389]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-6 max-w-xs sm:max-w-md mx-auto text-sm sm:text-base">
          Add original products to your bag and start a healthy lifestyle today!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#167389] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-cyan-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base font-medium"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-32 lg:pb-8">
      <div className="mx-auto max-w-6xl px-3 xs:px-4 sm:px-6 lg:px-8 py-16 sm:py-16">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#167389]" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              Shopping Bag
            </h1>
            <button
              onClick={clearCart}
              className="ml-auto text-sm text-red-500 hover:underline"
            >
              Clear bag
            </button>
          </div>
        </div>

        {/* Items + summary grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Items list (left/main) */}
          <div className="lg:col-span-2 space-y-2">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item) => {
                const price = toNum(item.price);
                const qty = Math.max(1, toNum(item.quantity, 1));
                const line = price * qty;
                const stock = getStock(item);
                const outOfStock = stock === 0;
                const atMax = qty >= stock;
                const loading = loadingId === item._id;

                return (
                  <motion.div
                    key={item._id}
                    layout="position"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="bg-white rounded-md border border-cyan-200 p-2 sm:p-4 md:p-5 shadow-sm flex items-center gap-3 h-30"
                  >
                    {/* Left: image */}
                    <div className="relative shrink-0">
                      <div className="w-30 h-25 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-md p-1 overflow-hidden bg-gray-50 ring-1 ring-cyan-100 flex items-center justify-center">
                        <Image
                          src={item.image || "https://via.placeholder.com/112"}
                          alt={item.title}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full transition-transform duration-300"
                        />
                      </div>
                      {outOfStock && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">
                          Out
                        </span>
                      )}
                    </div>

                    {/* Middle: details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1 pr-3">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg mb-1 line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {item.brand || item.manufacturer || ""}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                            <span className="font-semibold text-cyan-700">
                              {money(price)}
                            </span>
                            <span>
                              ({money(price)} × {qty})
                            </span>
                            {Number.isFinite(stock) && stock !== Infinity && (
                              <span className="ml-1 text-[11px] sm:text-xs text-gray-500">
                                Stock: {stock}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* remove button */}
                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          aria-label={`Remove ${item.title}`}
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>

                      {/* Quantity & line total row */}
                      <div className="mt-3 flex items-center justify-between gap-3">
                        {/* qty controls */}
                        <div className="flex items-center gap-1 bg-cyan-50 rounded-xl px-1 py-1">
                          <button
                            onClick={() =>
                              safeUpdateQuantity(item._id, Math.max(1, qty - 1))
                            }
                            disabled={qty <= 1 || outOfStock}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-100 transition disabled:opacity-50"
                            aria-label={`Decrease quantity for ${item.title}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <div className="min-w-[2.2rem] text-center font-semibold text-gray-800 text-sm">
                            {loading ? "..." : qty}
                          </div>

                          <button
                            onClick={() =>
                              safeUpdateQuantity(
                                item._id,
                                Math.min(stock || qty + 1, qty + 1)
                              )
                            }
                            disabled={outOfStock || atMax}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md bg-white border border-cyan-200 text-cyan-700 hover:bg-cyan-100 transition disabled:opacity-50"
                            aria-label={`Increase quantity for ${item.title}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* line total */}
                        <div className="text-right">
                          <div className="text-[10px] sm:text-xs text-gray-500 leading-none">
                            Total
                          </div>
                          <div className="text-sm sm:text-base md:text-lg font-bold text-cyan-700">
                            {money(line)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Clear cart button mobile */}
            <button
              onClick={clearCart}
              className="w-full lg:hidden flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm sm:text-base font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>

            {/* mobile summary (below list) */}
            <div className="block lg:hidden mt-4 sm:mt-6">
              <SummaryPanel compact />
            </div>
          </div>

          {/* Desktop summary */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-4">
              <SummaryPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom checkout bar (mobile) */}
      <div className="fixed left-0 right-0 bottom-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-3 lg:hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-bold text-[#167389]">{money(grandTotal)}</div>
          </div>
          <Link href="/checkout" className="flex-1">
            <button
              className="w-full bg-[#47c7ac] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition"
              aria-label="Place order and go to checkout"
            >
              Checkout
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
