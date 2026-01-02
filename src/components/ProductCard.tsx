/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/ProductCard.tsx */
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Plus, Minus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { AppProduct } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

type Props = {
  product: AppProduct | any;
  showDiscount?: boolean;
  compact?: boolean;
  onAddToCart?: (p: any, qty?: number) => Promise<void> | void;
  onLocalStockChange?: (id: string, newStock: number) => void;
  variant?: "default" | "compact";
  isMobileScroll?: boolean;
};

const formatPrice = (v?: number) =>
  `৳${Number(v ?? 0).toLocaleString("en-BD")}`;

export default function ProductCard({
  product,
  showDiscount = true,
  compact = false,
  onAddToCart,
  onLocalStockChange,
  variant = "default",
  isMobileScroll = false,
}: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const title = String(product?.title ?? product?.name ?? "Untitled");
  const slug = String(product?.slug ?? product?._id ?? "");
  const images = Array.isArray(product?.images)
    ? product.images
    : product?.image
      ? [product.image]
      : [];
  const image = images.length ? images[0] : "/images/placeholder.png";
  const price = Number(product?.price ?? 0);
  const compare = Number(product?.compareAtPrice ?? 0);
  const discount =
    compare > price && price > 0
      ? Math.round(((compare - price) / compare) * 100)
      : 0;

  // reserved quantity from cart (items already in cart)
  const reservedQty = useMemo(() => {
    const found = cartItems.find((c) => String(c._id) === String(product._id));
    return found?.quantity ?? 0;
  }, [cartItems, product._id]);

  // source-of-truth stock: prefer availableStock then stock then 0
  const sourceStock = Number(
    product?.availableStock ?? product?.stock ?? product?.inventory ?? 0
  );

  // local optimistic stock (starts from sourceStock)
  const [localStock, setLocalStock] = useState<number>(sourceStock);
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    setLocalStock(sourceStock);
  }, [sourceStock, product._id]);

  // helper: notify parent/shelf about local stock change
  const notifyLocalStock = useCallback(
    (newStock: number) => {
      setLocalStock(newStock);
      try {
        if (typeof onLocalStockChange === "function") {
          onLocalStockChange(String(product._id), newStock);
        }
      } catch (e) {
        console.error("onLocalStockChange callback error", e);
      }
    },
    [onLocalStockChange, product._id]
  );

  // available (after reserved by cart)
  const available = Math.max(0, localStock - reservedQty);
  const isOut = available <= 0;
  const isLow = !isOut && available <= 5;

  // Quantity handlers - same behavior as TrendingGrid
  const updateQuantity = useCallback(
    (newQty: number) => {
      const safeQty = Math.max(
        1,
        Math.min(newQty, Math.max(1, available || 1))
      );
      setQuantity(safeQty);
    },
    [available]
  );

  const incrementQuantity = useCallback(() => {
    updateQuantity(quantity + 1);
  }, [quantity, updateQuantity]);

  const decrementQuantity = useCallback(() => {
    updateQuantity(quantity - 1);
  }, [quantity, updateQuantity]);

  const handleAdd = async () => {
    if (isOut) {
      toast.error("Out of stock");
      return;
    }
    if (quantity > available) {
      toast.error(`Only ${available} items available in stock`);
      return;
    }

    try {
      setAdding(true);

      if (onAddToCart) {
        await Promise.resolve(onAddToCart(product, quantity));
      } else {
        addItem({
          _id: String(product._id),
          title,
          slug,
          price,
          image,
          quantity: quantity,
        });
      }

      toast.success(`${quantity} × ${title} added to cart`);

      // Reset quantity after successful add
      setQuantity(1);
    } catch (e) {
      console.error("Add to Bag failed", e);
      toast.error("Failed to Add to Bag");
    } finally {
      setTimeout(() => setAdding(false), 250);
    }
  };

  const handleBuyNow = async () => {
    if (isOut) {
      toast.error("Out of stock");
      return;
    }

    try {
      setBuying(true);
      await handleAdd();
      router.push("/checkout");
    } catch (e) {
      console.error(e);
    } finally {
      setBuying(false);
    }
  };

  const totalPrice = price * quantity;

  /* -----------------------
     Desktop / original card
     (kept unchanged aside from wrapping)
     ----------------------- */
  const DesktopCard = (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={`group bg-white rounded-2xl shadow-sm transition-shadow overflow-hidden border border-gray-100 flex flex-col ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <Link
        href={`/products/${slug}`}
        className={`relative w-full bg-white flex items-center justify-center overflow-hidden ${
          compact ? "h-36 sm:h-40" : "h-44 sm:h-52 md:h-64"
        }`}
        aria-label={`View ${title}`}
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />

        {/* TOP LEFT: discount / low / out badge */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          {showDiscount && discount > 0 && (
            <span className="bg-linear-to-r from-pink-600 to-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {isOut ? (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              Out
            </span>
          ) : isLow ? (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
              Low
            </span>
          ) : null}
        </div>

        {/* TOP RIGHT: small reserved indicator */}
        <div className="absolute top-3 right-3 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full shadow">
          {reservedQty > 0 ? `In cart: ${reservedQty}` : "Available"}
        </div>

        {/* BOTTOM LEFT: prominent Stock badge (visible) */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <div
            className={`text-xs px-2 py-1 rounded-full shadow-sm font-semibold ${
              isOut ? "bg-red-600 text-white" : "bg-white/95 text-gray-800"
            }`}
            aria-hidden
          >
            {isOut ? "Out of stock" : `Stock: ${available}`}
          </div>
        </div>
      </Link>

      <div className={`flex flex-col flex-1 ${compact ? "pt-2" : "pt-4"}`}>
        <Link href={`/products/${slug}`} className="mb-2">
          <h3
            className={`font-semibold text-gray-800 line-clamp-2 ${
              compact ? "text-sm min-h-8" : "text-base min-h-10"
            }`}
          >
            {title}
          </h3>
        </Link>

        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-bold text-gray-900 ${
                compact ? "text-lg" : "text-xl"
              }`}
            >
              {formatPrice(totalPrice)}
            </span>
            {compare > price && (
              <span className="text-gray-500 line-through text-sm">
                {formatPrice(price * quantity)}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-600">
            {isOut ? (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            ) : isLow ? (
              <span className="text-orange-500 font-semibold">
                Only {available} left
              </span>
            ) : (
              <span className="text-green-600 font-semibold">In Stock</span>
            )}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-gray-600 font-medium ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            Qty:
          </span>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1 || adding || buying || isOut}
              className={`flex items-center justify-center rounded-md bg-white border border-gray-300 transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                compact ? "w-6 h-6" : "w-7 h-7"
              }`}
              aria-label="Decrease quantity"
            >
              <Minus className={compact ? "w-3 h-3" : "w-4 h-4"} />
            </button>
            <span
              className={`font-bold text-gray-800 mx-1 ${
                compact ? "w-6 text-xs" : "w-7 text-sm"
              } text-center`}
            >
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              disabled={adding || buying || isOut || quantity >= available}
              className={`flex items-center justify-center rounded-md bg-white border border-gray-300 transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                compact ? "w-6 h-6" : "w-7 h-7"
              }`}
              aria-label="Increase quantity"
            >
              <Plus className={compact ? "w-3 h-3" : "w-4 h-4"} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`mt-auto space-y-2 ${compact ? "space-y-1" : "space-y-2"}`}
        >
          <div
            className={`flex gap-2 ${compact ? "flex-col" : "flex-col sm:flex-row"}`}
          >
            <button
              onClick={handleAdd}
              disabled={isOut || adding || buying}
              className={`flex items-center justify-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 ${
                compact
                  ? "px-2 py-1.5 text-xs bg-[#167389] text-white"
                  : "flex-1 px-3 py-2 text-sm bg-[#167389] text-white hover:bg-[#135a6b]"
              }`}
            >
              {adding
                ? "Adding..."
                : `Add ${quantity > 1 ? `(${quantity})` : ""}`}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOut || adding || buying}
              className={`flex items-center justify-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 ${
                compact
                  ? "px-2 py-1.5 text-xs bg-linear-to-r from-pink-600 to-rose-600 text-white"
                  : "flex-1 px-3 py-2 text-sm bg-linear-to-r from-pink-600 to-rose-600 text-white hover:from-pink-700 hover:to-rose-700"
              }`}
            >
              <Eye className={compact ? "w-3 h-3" : "w-4 h-4"} />
              <span>{buying ? "Buying..." : "Buy Now"}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );

  /* -----------------------
     Mobile card (matches TrendingGrid mobile layout)
     ----------------------- */
  const MobileCard = (
    <article className={`lg:hidden bg-white rounded-md overflow-hidden border border-cyan-300 shadow-sm p-2 flex flex-col gap-1 ${
      isMobileScroll ? 'min-w-[48%] max-w-[48%] shrink-0' : 'w-full'
    }`}>
      <div className="w-full">
        <div className="relative h-24 rounded-md overflow-hidden border flex items-center justify-center bg-white">
          {showDiscount && discount > 0 && (
            <span className="absolute top-1 left-1 bg-pink-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold z-10">
              {discount}% OFF
            </span>
          )}
          {isOut && (
            <span className="absolute top-1 right-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold z-10">
              Out
            </span>
          )}
          <Link href={`/products/${slug}`} aria-label={`View ${title}`}>
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width:640px) 50vw"
              className="object-contain"
            />
          </Link>
        </div>
        <div className="mt-1">
          <h3 className="text-[11px] font-semibold line-clamp-2 text-black leading-tight">
            {title}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="text-sm text-black font-bold">
              {formatPrice(price * quantity)}
            </div>
            {compare > price && (
              <div className="text-[10px] text-gray-500 line-through">
                {formatPrice(compare * quantity)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-between gap-1">
        <div className="text-[10px] text-gray-600">
          {isOut ? (
            <span className="text-red-600 font-semibold">Out of Stock</span>
          ) : (
            <span className="text-green-600 font-semibold">Stock: {available}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 bg-gray-200 rounded px-0.5 py-0.5">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1 || adding || buying || isOut}
            className="w-4 h-4 rounded bg-white text-black flex items-center justify-center text-xs font-bold disabled:opacity-50"
          >
            −
          </button>
          <span className="w-5 text-center text-xs font-bold text-black">{quantity}</span>
          <button
            onClick={incrementQuantity}
            disabled={adding || buying || isOut || quantity >= available}
            className="w-4 h-4 rounded bg-white text-black flex items-center justify-center text-xs font-bold disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="w-full flex gap-1">
        <button
          onClick={handleAdd}
          disabled={isOut || adding || buying}
          className="flex-1 px-1 py-1.5 bg-[#167389] text-white rounded-md text-[10px] font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {adding ? "Adding..." : "Add to Bag"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isOut || adding || buying}
          className="flex-1 px-1 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-md text-[10px] font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {buying ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </article>
  );

  // Render: show MobileCard only on small screens and DesktopCard hidden on small screens.
  return (
    <>
      {/* Mobile card (visible only below lg) */}
      {MobileCard}

      {/* Desktop / larger screens */}
      <div className="hidden lg:block">{DesktopCard}</div>
    </>
  );
}
