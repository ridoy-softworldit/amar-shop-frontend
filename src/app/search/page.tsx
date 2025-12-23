/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useEffect, useState, useCallback } from "react";
import {
  useGetProductsPaginatedQuery,
  useLazyGetProductsPaginatedQuery,
  useConfirmOrderMutation,
} from "@/services/catalog.api";
import { ZProduct, type Product } from "@/lib/schemas";
import type { ProductsQuery } from "@/services/catalog";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";
import ProductCard from "@/components/ProductCard";


const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#fdf2f8'/><text x='50%' y='50%' text-anchor='middle' fill='#ec4899' font-size='20' font-family='Arial'>✨ Product</text></svg>`
  );

// Build queryArg same as before
function buildQueryArg(sp: URLSearchParams): ProductsQuery {
  const discounted: "true" | undefined =
    sp.get("discounted") === "true" ? "true" : undefined;
  const featured: "true" | undefined =
    sp.get("tag") === "featured" ? "true" : undefined;
  const tag = sp.get("tag") ?? undefined;
  const sortParam = sp.get("sort");
  const sort =
    sortParam === "new" || sortParam === "createdAt:desc"
      ? "createdAt:desc"
      : undefined;
  return { discounted, featured, tag, sort, limit: 24, page: 1 };
}

export default function SearchPageRTK() {
  const sp = useSearchParams();
  const queryArg = useMemo(() => buildQueryArg(sp), [sp]);
  const router = useRouter();

  // initial page fetch via RTK
  const { data: initial, isLoading: initialLoading } =
    useGetProductsPaginatedQuery(queryArg, {});

  // lazy query for subsequent pages
  const [trigger, { data: nextPageData, isFetching: isFetchingNext }] =
    useLazyGetProductsPaginatedQuery();

  // confirm order mutation (used for Buy Now)
  const [confirmOrder] = useConfirmOrderMutation();

  // local merged items + pager
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // cart store
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s: any) =>
    s.removeItem ? s.removeItem : () => {}
  );

  // seed from initial RTK result
  useEffect(() => {
    if (!initial) {
      setItems([]);
      setPage(1);
      setPages(null);
      setHasMore(false);
      return;
    }
    setItems(initial.items ?? []);
    setPage(initial.page ?? 1);
    setPages(initial.pages ?? null);
    setHasMore(
      Boolean(
        initial.pages
          ? (initial.page ?? 1) < (initial.pages ?? 0)
          : (initial.items?.length ?? 0) >= (initial.limit ?? 24)
      )
    );
  }, [initial]);

  // when next page arrives from trigger, append
  useEffect(() => {
    if (!nextPageData) return;
    const nextItems = nextPageData.items ?? [];
    if (nextItems.length === 0) {
      setHasMore(false);
      return;
    }
    setItems((prev) => [...prev, ...nextItems]);
    setPage(nextPageData.page ?? ((p) => p + 1));
    setPages(nextPageData.pages ?? pages);
    setHasMore(
      Boolean(
        nextPageData.page && nextPageData.pages
          ? nextPageData.page < nextPageData.pages
          : nextItems.length >= (nextPageData.limit ?? 24)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPageData]);

  // load more handler using RTK lazy trigger
  const loadMore = async () => {
    setLoadError(null);
    try {
      const nextPage = (page || 1) + 1;
      const arg = { ...(queryArg || {}), page: nextPage };
      const res = await trigger(arg).unwrap();
      if (!res || (res.items?.length ?? 0) === 0) {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("RTK loadMore error", err);
      setLoadError(err?.message ?? "Failed to load more");
    }
  };

  const parsedProducts = items.map((p) => {
    try {
      return ZProduct.parse(p) as Product;
    } catch {
      return p as Product;
    }
  });

  // ----------------- MOBILE UI state: quantities & loading per product -----------------
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  
  useEffect(() => {
    if (!parsedProducts || parsedProducts.length === 0) return;

    setQuantities((prev) => {
     
      let changed = false;
      const next = { ...prev }; 

      for (const p of parsedProducts) {
        const id = String(p._id ?? "");
        if (!id) continue;
        if (!(id in next)) {
          next[id] = 1;
          changed = true;
        }
      }

      
      return changed ? next : prev;
    });
    
  }, [parsedProducts.length]);

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
    (productId: string, newQty: number, maxQty = 1) => {
      setQuantities((prev) => {
        const safe = Math.max(1, Math.min(newQty, Math.max(1, maxQty)));
        if (prev[productId] === safe) return prev;
        return { ...prev, [productId]: safe };
      });
    },
    []
  );

  const incrementQuantity = useCallback((productId: string, maxQty = 1) => {
    setQuantities((prev) => {
      const cur = prev[productId] ?? 1;
      const safe = Math.min(maxQty, cur + 1);
      return { ...prev, [productId]: safe };
    });
  }, []);

  const decrementQuantity = useCallback((productId: string) => {
    setQuantities((prev) => {
      const cur = prev[productId] ?? 1;
      const safe = Math.max(1, cur - 1);
      return { ...prev, [productId]: safe };
    });
  }, []);

  // Add to Bag handler (same behaviour as TrendingGrid)
  const handleAddToCart = useCallback(
    async (p: Product) => {
      const id = p._id;
      const qty = quantities[id] ?? 1;
      const stock = Math.max(0, Number(p.stock ?? 0));

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
            (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '') ||
            (p.image && typeof p.image === 'string' ? p.image : '') ||
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

  // Buy Now: Add to Bag, confirmOrder, remove from cart and go to checkout
  const handleBuyNow = useCallback(
    async (p: Product) => {
      const id = p._id;
      const qty = quantities[id] ?? 1;
      const stock = Math.max(0, Number(p.stock ?? 0));

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

        // Add to Bag to reserve
        addItem({
          _id: id,
          title: p.title,
          slug: p.slug ?? "",
          price: Number(p.price ?? 0),
          image:
            (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '') ||
            (p.image && typeof p.image === 'string' ? p.image : '') ||
            FALLBACK_IMG,
          quantity: qty,
        });

        const payload = { items: [{ _id: id, quantity: qty }] };
        const response = await confirmOrder(payload).unwrap();

        if (response?.ok) {
          // remove immediately to avoid double counting if store supports
          try {
            (removeItem as any)(id);
          } catch (e) {
            // ignore if not supported
          }

          // Success -> redirect to checkout
          toast.success("Redirecting to checkout...");
          router.push("/checkout");
        } else {
          toast.error("Failed to process order");
        }
      } catch (err: any) {
        console.error("Buy Now failed:", err);
        
        // Check if it's a network/API error
        if (err?.status === 'FETCH_ERROR' || err?.error) {
          toast.error("Network error. Please check your connection.");
          return;
        }
        
        if (err?.data?.code === "INSUFFICIENT_STOCK" || err?.status === 409) {
          toast.error("Insufficient stock to place order");
        } else if (err?.status === 401 || err?.status === 403) {
          toast.error("Authentication required. Please login.");
        } else {
          // Fallback: just add to cart and redirect
          toast.success("Item added to cart. Redirecting...");
          router.push("/checkout");
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
      router,
      setLoadingOff,
      setLoadingOn,
    ]
  );

  return (
    <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Search
        </h1>
      </div>

      {initialLoading && parsedProducts.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[260px] bg-pink-50 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : parsedProducts.length > 0 ? (
        <>
          {/* ============================
              MOBILE LIST: stacked cards (image left, info center, actions right)
              visible only on small screens (lg:hidden)
             ============================ */}
          <div className="lg:hidden space-y-3">
            {parsedProducts.map((p) => {
              const cover =
                (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '') ||
                (p.image && typeof p.image === 'string' && p.image.trim()) ||
                FALLBACK_IMG;

              const showCompare =
                p.compareAtPrice != null &&
                p.price != null &&
                Number(p.compareAtPrice) > Number(p.price);

              const discount = showCompare
                ? Math.round(
                    ((Number(p.compareAtPrice) - Number(p.price)) /
                      Number(p.compareAtPrice)) *
                      100
                  )
                : 0;

              const qty = quantities[p._id ?? p._id] ?? quantities[p._id] ?? 1;
              const loading = !!loadingStates[p._id];
              const stock = Math.max(0, Number(p.stock ?? 0));

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm p-2 flex items-center gap-2"
                >
                  {/* LEFT: small image + discount badge above image */}
                  <div className="w-24 shrink-0">
                    <div className="mb-1">
                      {discount > 0 && (
                        <span className="inline-block bg-pink-50 text-pink-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {discount}%
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/products/${encodeURIComponent(p.slug)}`}
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
                      href={`/products/${encodeURIComponent(p.slug)}`}
                      className="block"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {p.title}
                      </h3>
                    </Link>

                    <div className="mt-2 flex items-center gap-3">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          ৳{Number(p.price).toLocaleString()}
                        </div>
                        {showCompare && (
                          <div className="text-xs text-gray-400 line-through">
                            ৳{Number(p.compareAtPrice).toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="inline-block mr-2">
                            🕘 Delivery:
                          </span>
                          <span>Mon, 17 Nov</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: qty + actions (vertical) */}
                  <div className="w-28 shrink-0 flex flex-col justify-between">
                    {/* Qty */}
                    <div>
                      <div className="text-xs text-gray-700 font-medium mb-1">
                        Qty
                      </div>

                      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                        <button
                          onClick={() => decrementQuantity(p._id)}
                          disabled={loading || (quantities[p._id] ?? 1) <= 1}
                          className="w-6 h-6 rounded-md bg-white text-black border flex items-center justify-center disabled:opacity-50"
                          aria-label={`Decrease quantity for ${p.title}`}
                        >
                          −
                        </button>

                        <div className="flex-1 text-black text-center font-bold">
                          {quantities[p._id] ?? 1}
                        </div>

                        <button
                          onClick={() =>
                            incrementQuantity(p._id, Math.max(1, stock))
                          }
                          disabled={
                            loading ||
                            (quantities[p._id] ?? 1) >= Math.max(1, stock)
                          }
                          className="w-6 h-6 rounded-md bg-white text-black border flex items-center justify-center disabled:opacity-50"
                          aria-label={`Increase quantity for ${p.title}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="mt-1">
                        <div className="text-sm text-black font-semibold">
                          {`৳${((Number(p.price) || 0) * (quantities[p._id] ?? 1)).toLocaleString()}`}
                        </div>
                        {showCompare && (
                          <div className="text-xs text-gray-500 line-through">
                            ৳{(Number(p.compareAtPrice) || 0).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-1 my-1">
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={stock === 0 || loading}
                        className="w-full px-1 py-1 bg-[#167389] text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Adding..." : "Add to Bag"}
                      </button>

                      <button
                        onClick={() => handleBuyNow(p)}
                        disabled={stock === 0 || loading}
                        className="w-full px-2 py-1 bg-linear-to-r from-pink-600 to-rose-600 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Processing..." : "Buy Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============================
              DESKTOP GRID: using ProductCard component
             ============================ */}
          <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {parsedProducts.map((p) => {
              const productData = {
                ...p,
                _id: p._id,
                title: p.title,
                slug: p.slug,
                price: Number(p.price ?? 0),
                compareAtPrice: Number(p.compareAtPrice ?? 0),
                image: p.image ?? (Array.isArray(p.images) ? p.images[0] : undefined) ?? FALLBACK_IMG,
                stock: Number(p.stock ?? 0),
              };
              return (
                <div key={p._id}>
                  <ProductCard product={productData} showDiscount={true} />
                </div>
              );
            })}
          </div>

          {/* pagination / load more */}
          <div className="flex flex-col items-center mt-8 gap-3">
            {loadError && (
              <div className="text-sm text-red-600">{loadError}</div>
            )}
            {hasMore ? (
              <button
                onClick={loadMore}
                disabled={isFetchingNext}
                className="px-6 py-3 rounded-full bg-[#167389] text-white font-semibold hover:opacity-95 disabled:opacity-60"
              >
                {isFetchingNext ? "Loading..." : "View more"}
              </button>
            ) : (
              <div className="text-sm text-gray-500">No more products</div>
            )}
            {pages ? (
              <div className="text-xs text-gray-500">
                Page {page} of {pages}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">No products found.</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 rounded-full bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
          >
            Back to Home
          </Link>
        </div>
      )}
    </main>
  );
}
