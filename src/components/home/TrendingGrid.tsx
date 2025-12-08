/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/TrendingGrid.tsx */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";
import { createOrder } from "@/services/orders";
import type { AppProduct } from "@/types/product";

interface TrendingGridProps {
  title?: string;
  subtitle?: string;
  products: AppProduct[];
  className?: string;
}

interface ComputedProduct {
  p: AppProduct;
  image: string;
  price: number;
  compare: number;
  discount: number;
  stock: number;
  qty: number;
  total: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
}

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#f8fafc'/><text x='50%' y='50%' text-anchor='middle' fill='#ec4899' font-size='20' font-family='Arial'>No image</text></svg>`
  );
const LOW_STOCK_THRESHOLD = 5;
const MAX_INITIAL_DISPLAY = 8;
const MAX_MOBILE_DISPLAY = 4;
const formatPrice = (v: number) => `৳${Number(v || 0).toLocaleString("en-BD")}`;

const calculateDiscount = (price = 0, compare = 0): number => {
  if (compare > price && price > 0)
    return Math.round(((compare - price) / compare) * 100);
  return 0;
};

const getSafeImageUrl = (image: unknown): string => {
  if (!image || image === "null" || image === "undefined" || image === "")
    return DEFAULT_IMAGE;
  if (typeof image === "string") {
    if (image.startsWith("data:")) return image;
    if (/^https?:\/\//.test(image)) return image;
    if (image.startsWith("/") && !image.includes("placeholder.png"))
      return image;
  }
  return DEFAULT_IMAGE;
};

const ProductImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [imgSrc, setImgSrc] = useState(getSafeImageUrl(src));
  useEffect(() => setImgSrc(getSafeImageUrl(src)), [src]);
  return (
    // Next/Image props minimal to avoid hydration surprises
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
      className={className}
      onError={() => setImgSrc(DEFAULT_IMAGE)}
      unoptimized={imgSrc.startsWith("data:")}
    />
  );
};

export default function TrendingGrid({
  title = "Trending",
  subtitle = "Best Deals Right Now - Select Quantity and Order Instantly",
  products = [],
  className,
}: TrendingGridProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s: any) => s.removeItem ?? (() => {}));
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const inFlightRef = useRef<Record<string, boolean>>({}); // prevent re-entrancy (double-click)
  const isMountedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // initialize quantities once when products change length
    if (!products?.length) return;
    setQuantities((prev) => {
      const next: Record<string, number> = { ...prev };
      for (const p of products) {
        if (!next[p._id]) next[p._id] = 1;
      }
      return next;
    });
  }, [products?.length]);

  // calculate available stock factoring local cart reservations
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const product of products) {
      const totalStock = Math.max(0, Number(product.stock ?? 0));
      const reserved =
        cartItems.find((i) => i._id === product._id)?.quantity || 0;
      map[product._id] = Math.max(0, totalStock - reserved);
    }
    return map;
  }, [products, cartItems]);

  const computedProducts: ComputedProduct[] = useMemo(() => {
    return (products || []).map((product) => {
      let imageSource = "";
      if (
        product.image &&
        product.image !== "null" &&
        product.image !== "undefined"
      )
        imageSource = product.image as string;
      else if (
        Array.isArray((product as any).images) &&
        (product as any).images.length
      )
        imageSource = (product as any).images[0];

      const image = getSafeImageUrl(imageSource);
      const price = Number(product.price ?? 0);
      const compare = Number(product.compareAtPrice ?? 0);
      const discount = calculateDiscount(price, compare);
      const availableStock = stockMap[product._id] ?? 0;
      const quantity = quantities[product._id] || 1;
      const total = price * quantity;
      const isOutOfStock = availableStock === 0;
      const isLowStock =
        availableStock > 0 && availableStock <= LOW_STOCK_THRESHOLD;

      return {
        p: product,
        image,
        price,
        compare,
        discount,
        stock: availableStock,
        qty: quantity,
        total,
        isOutOfStock,
        isLowStock,
      };
    });
  }, [products, quantities, stockMap]);

  const setLoading = useCallback((productId: string, val: boolean) => {
    setLoadingStates((prev) =>
      val
        ? { ...prev, [productId]: true }
        : (() => {
            const n = { ...prev };
            delete n[productId];
            return n;
          })()
    );
  }, []);

  const incrementQuantity = useCallback(
    (productId: string) => {
      setQuantities((prev) => {
        const current = prev[productId] || 1;
        const max = stockMap[productId] || 1;
        const next = Math.min(current + 1, Math.max(1, max));
        if (next === current) return prev;
        return { ...prev, [productId]: next };
      });
    },
    [stockMap]
  );

  const decrementQuantity = useCallback((productId: string) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current - 1);
      if (next === current) return prev;
      return { ...prev, [productId]: next };
    });
  }, []);

  const handleAddToCart = useCallback(
    async (productData: ComputedProduct) => {
      const { p, qty, stock } = productData;
      if (qty <= 0) {
        toast.error("Please select a valid quantity");
        return;
      }
      if (qty > stock) {
        toast.error(`Only ${stock} items available`);
        return;
      }
      if (loadingStates[p._id]) return;

      try {
        setLoading(p._id, true);
        // optimistic local add
        addItem({
          _id: p._id,
          title: p.title,
          slug: p.slug || "",
          price: productData.price,
          image: productData.image,
          quantity: qty,
        });
        toast.success(`${qty} × ${p.title} added to cart`);
        setQuantities((prev) => ({ ...prev, [p._id]: 1 }));
      } catch (err) {
        console.error("Add to Bag error:", err);
        toast.error("Could not Add to Bag");
      } finally {
        setTimeout(() => setLoading(p._id, false), 200);
      }
    },
    [addItem, loadingStates, setLoading]
  );

  useEffect(() => {
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
  }, [mounted, computedProducts.length]);

  const handleBuyNow = useCallback(
    async (productData: ComputedProduct) => {
      const { p, qty, stock, price, image } = productData;
      if (qty <= 0) {
        toast.error("Please select a valid quantity");
        return;
      }
      if (qty > stock) {
        toast.error(`Only ${stock} items available`);
        return;
      }
      if (inFlightRef.current[p._id]) return; // already in-flight
      inFlightRef.current[p._id] = true;
      setLoading(p._id, true);

      try {
        // optimistic local reserve
        addItem({
          _id: p._id,
          title: p.title,
          slug: p.slug || "",
          price,
          image,
          quantity: qty,
        });

        toast.success("Redirecting to checkout...");
        router.push("/checkout");
      } catch (err: any) {
        console.error("BuyNow error:", err);
        // prefer server-provided messages
        if (err?.data?.code === "OUT_OF_STOCK" || err?.status === 409)
          toast.error("Insufficient stock to place order");
        else if (err?.status === 500)
          toast.error(
            "Order service temporarily unavailable. Please try again."
          );
        else toast.error(err?.message || "Could not place order. Try again.");
      } finally {
        setLoading(p._id, false);
        inFlightRef.current[p._id] = false;
      }
    },
    [addItem, removeItem, router, setLoading]
  );

  // render
  if (!mounted) {
    return (
      <section className={className}>
        <div className="product-section">
          <div className="product-section__header flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            </div>
          </div>
          <div className="lg:hidden space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl h-72 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="product-section">
        <div className="product-section__header flex items-center justify-between mb-3 lg:mb-6">
          <div>
            <h2 className="text-base lg:text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs lg:text-sm text-gray-600 mt-0.5 lg:mt-1 line-clamp-2 font-extralight">{subtitle}</p>
          </div>
          <Link
            href="/search?tag=trending"
            className="text-xs lg:text-sm text-white bg-cyan-600 font-medium hover:bg-cyan-700 rounded-md px-2 py-1.5 lg:px-3 lg:py-2 whitespace-nowrap"
          >
            See all
          </Link>
        </div>

        {/* mobile */}
        <div ref={scrollRef} className="lg:hidden overflow-x-auto scrollbar-hide scroll-smooth">
          <div className="flex gap-3 pb-2">
          {computedProducts.map((prod) => (
            <div
              key={prod.p._id}
              className="bg-white min-w-[48%] max-w-[48%] flex-shrink-0 rounded-md overflow-hidden border border-cyan-300 shadow-sm p-2 flex flex-col gap-1"
            >
              <div className="w-full">
                <div className="relative h-24 rounded-md overflow-hidden border flex items-center justify-center bg-white">
                  {prod.discount > 0 && (
                    <span className="absolute top-1 left-1 bg-pink-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold z-10">
                      {prod.discount}% OFF
                    </span>
                  )}
                  <Link href={`/products/${prod.p.slug}`}>
                    <ProductImage
                      src={prod.image}
                      alt={prod.p.title}
                      className="object-contain"
                    />
                  </Link>
                </div>
                <div className="mt-1">
                  <h3 className="text-[11px] font-semibold line-clamp-2 text-black leading-tight">
                    {prod.p.title}
                  </h3>
                </div>
              </div>

              <div className="w-full flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <div className="text-sm text-black font-bold">
                    {formatPrice(prod.price * prod.qty)}
                  </div>
                  {prod.discount > 0 && (
                    <div className="text-[10px] text-gray-500 line-through">
                      {formatPrice(prod.compare * prod.qty)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-0.5 bg-gray-200 rounded px-1 py-0.5">
                  <button
                    onClick={() => decrementQuantity(prod.p._id)}
                    disabled={!!loadingStates[prod.p._id] || prod.qty <= 1}
                    className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-black">{prod.qty}</span>
                  <button
                    onClick={() => incrementQuantity(prod.p._id)}
                    disabled={!!loadingStates[prod.p._id] || prod.qty >= Math.max(1, prod.stock)}
                    className="w-5 h-5 rounded bg-white text-black flex items-center justify-center text-xs font-bold disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(prod)}
                disabled={prod.isOutOfStock || !!loadingStates[prod.p._id]}
                className="w-full px-2 py-1.5 bg-[#167389] text-white rounded-md text-xs font-medium disabled:opacity-50"
              >
                {loadingStates[prod.p._id] ? "Adding..." : "Add to Bag"}
              </button>
            </div>
          ))}
          
          {/* See All Card */}
          <Link
            href="/search?tag=trending"
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

        {/* desktop */}
        <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {computedProducts.slice(0, MAX_INITIAL_DISPLAY).map((prod) => (
            <div
              key={prod.p._id}
              className={`group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${prod.isOutOfStock ? "opacity-60 grayscale" : "hover:shadow-md hover:border-gray-300"} transition-all duration-300 h-full flex flex-col`}
            >
              <div className="relative w-full h-44 sm:h-52 md:h-64 flex-shrink-0 flex items-center justify-center">
                <Link
                  href={`/products/${prod.p.slug}`}
                  className="w-full h-full block"
                >
                  <ProductImage
                    src={prod.image}
                    alt={prod.p.title}
                    className="object-contain"
                  />
                </Link>
                {prod.discount > 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      {prod.discount}% OFF
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <div className="bg-white/60 rounded-full px-2 py-1 text-xs">
                    {prod.stock} in
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <Link
                  href={`/products/${prod.p.slug}`}
                  className="block mb-3 group-hover:text-pink-600 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem]">
                    {prod.p.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(prod.total)}
                    </span>
                    {prod.discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(prod.price * prod.qty)}
                      </span>
                    )}
                  </div>
                  {!prod.isOutOfStock && prod.stock < 20 && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {prod.stock} left
                    </span>
                  )}
                </div>

                <div className="mt-auto space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">Qty:</div>
                      <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-2">
                        <button
                          onClick={() => decrementQuantity(prod.p._id)}
                          disabled={
                            !!loadingStates[prod.p._id] || prod.qty <= 1
                          }
                          className="w-8 h-8 rounded-md bg-white text-black border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-black text-lg">
                          {prod.qty}
                        </span>
                        <button
                          onClick={() => incrementQuantity(prod.p._id)}
                          disabled={
                            !!loadingStates[prod.p._id] ||
                            prod.qty >= Math.max(1, prod.stock)
                          }
                          className="w-8 h-8 rounded-md bg-white text-black border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleAddToCart(prod)}
                      disabled={
                        prod.isOutOfStock || !!loadingStates[prod.p._id]
                      }
                      className="flex-1 px-4 py-2.5 bg-[#167389] text-white rounded-lg text-sm font-semibold"
                    >
                      {loadingStates[prod.p._id] ? (
                        "Adding..."
                      ) : (
                        <>Add to Bag {prod.qty > 1 ? `(${prod.qty})` : ""}</>
                      )}
                    </button>
                    <button
                      onClick={() => handleBuyNow(prod)}
                      disabled={
                        prod.isOutOfStock || !!loadingStates[prod.p._id]
                      }
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg text-sm font-semibold"
                    >
                      {loadingStates[prod.p._id] ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
