/* eslint-disable @typescript-eslint/no-explicit-any */

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchProduct, fetchProducts } from "@/services/catalog";
import type { Product } from "@/types"; // তোমার প্রোজেক্টে থাকা টাইপ
import { Check, Phone, Sparkles } from "lucide-react";
import ProductActions from "@/components/product/ProductActions";
import ProductThumbs from "@/components/product/ProductThumbs";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;
export const dynamic = "force-dynamic";

/**
 * Normalize fetchProducts response into Product[]
 * Accepts shapes:
 *  - Product[]
 *  - { items: Product[], total, page, ... }
 *  - { data: Product[] } or { data: { items: Product[] } }
 *  - { ok: true, data: ... }
 */
function normalizeProducts(resp: unknown): Product[] {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp as Product[];
  if (typeof resp !== "object") return [];

  const obj = resp as Record<string, any>;
  if (Array.isArray(obj.items)) return obj.items as Product[];
  if (Array.isArray(obj.data)) return obj.data as Product[];
  if (obj.data && Array.isArray(obj.data.items))
    return obj.data.items as Product[];
  if (Array.isArray(obj.results)) return obj.results as Product[];

  const firstArr = Object.values(obj).find((v) => Array.isArray(v));
  if (Array.isArray(firstArr)) return firstArr as Product[];

  return [];
}

/** ---------- Related product small card (uniform) ---------- */
/**
 * NOTE:
 * - product may come from different shapes (sometimes has `images[]`, sometimes only `image`).
 * - we use safe casting `(product as any).images` when checking `images` to avoid TS errors.
 */
function RelatedCard({ product }: { product: Product | any }) {
  const maybeImages = Array.isArray((product as any)?.images)
    ? (product as any).images
    : undefined;
  const img =
    product.image || (maybeImages ? maybeImages[0] : "") || "/fallback.webp";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="rel-card h-full flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-linear-to-br from-[#F5FDF8] to-[#F5FDF8]">
        <Image
          src={img}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-11">
          {product.title}
        </h3>

        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="text-pink-700 font-bold">
            ৳{Number(product.price || 0).toFixed(0)}
          </span>
          {typeof product.compareAtPrice === "number" &&
            product.compareAtPrice > (product.price || 0) && (
              <span className="text-gray-400 line-through text-sm">
                ৳{product.compareAtPrice}
              </span>
            )}
        </div>
      </div>
    </Link>
  );
}
/** --------------------------------------------------------- */

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const hotline = process.env.NEXT_PUBLIC_HOTLINE || "+8801318319610";
  const { slug } = await params;

  // use your existing fetchProduct (returns { ok, data })
  const res = await fetchProduct(slug).catch(() => null);

  // if product not found -> Next.js notFound (preserves behavior)
  if (!res?.data) return notFound();

  const product = res.data as Product;

  // images fallback (use safe any-casting where necessary)
  const galleryImages =
    Array.isArray((product as any)?.images) && (product as any).images.length
      ? (product as any).images.filter(Boolean)
      : [];
  const finalGallery = galleryImages.length
    ? galleryImages
    : product.image
      ? [product.image]
      : [];

  // Related: call fetchProducts and normalize shape safely
  let related: Product[] = [];
  if (product.categorySlug) {
    const raw = await fetchProducts({
      category: product.categorySlug,
      limit: 12,
      sort: "-createdAt",
    }).catch(() => null);

    // fetchProducts might return { ok:true, data: { items: [...] } } or { items: [...] } or direct [...]
    const candidate = raw?.data ?? raw;
    const arr = normalizeProducts(candidate);
    related = arr.filter((p) => p.slug !== product.slug).slice(0, 8);
  }

  const hasDiscount =
    !!product.isDiscounted ||
    (typeof product.compareAtPrice === "number" &&
      product.compareAtPrice > product.price);

  // sanitize description
  const rawDesc =
    typeof product.description === "string" ? product.description : "";
  const hasDesc = /\S/.test(rawDesc);
  const safeDesc = rawDesc.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(safeDesc);

  return (
    <div className="min-h-screen bg-[#F5FDF8] mt-6">
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 pt-10">
        {/* Mobile Compact Layout */}
        <div className="lg:hidden">
          <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-3 mb-4">
            {/* Product Name - Full Width at Top */}
            <h1 className="text-base font-bold text-gray-900 mb-3 leading-tight">
              {product.title}
            </h1>
            
            <div className="flex gap-3">
              {/* Left: Image (2/3) */}
              <div className="w-2/3">
                <div
                  id={`main-img-box-${product._id}`}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#F5FDF8] to-[#F5FDF8]"
                >
                  {finalGallery[0] ? (
                    <Image
                      src={finalGallery[0]}
                      alt={product.title}
                      fill
                      sizes="66vw"
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <ProductThumbs
                    title={product.title}
                    mainBoxId={`main-img-box-${product._id}`}
                    images={finalGallery}
                  />
                </div>
              </div>

              {/* Right: Pricing & Actions (1/3) */}
              <div className="w-1/3 flex flex-col">
                <div className="flex items-baseline gap-1 mb-1">
                  <div className="text-lg font-bold text-pink-600">
                    ৳{product.price.toFixed(0)}
                  </div>
                </div>
                {hasDiscount && typeof product.compareAtPrice === "number" && (
                  <div className="text-xs text-gray-400 line-through mb-1">
                    ৳{product.compareAtPrice.toFixed(0)}
                  </div>
                )}
                {hasDiscount && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-300 mb-2 inline-block">
                    Special Offer
                  </span>
                )}
                <div className="text-[10px] text-center mb-2 p-1.5 bg-gradient-to-r from-orange-50 to-rose-50 rounded-md border border-orange-200">
                  {product.stock && product.stock > 0 ? (
                    product.stock < 10 ? (
                      <span className="text-orange-600 font-semibold">Only {product.stock} left</span>
                    ) : (
                      <span className="text-green-600 font-semibold">In Stock</span>
                    )
                  ) : (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  )}
                </div>
                <div className="mt-auto space-y-2">
                  <ProductActions product={product} hotline={hotline} />
                </div>
              </div>
            </div>

            {/* Category Info */}
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">Category:</span>{" "}
              {product.categorySlug ? (
                <Link
                  className="text-[#167389] hover:text-pink-700 font-bold hover:underline"
                  href={`/products?category=${product.categorySlug}`}
                >
                  {product.categorySlug}
                </Link>
              ) : (
                <span className="text-gray-500">Not Available</span>
              )}
            </div>

            {/* Order by Phone */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-[10px] text-center text-gray-600 mb-2">Or Order by Phone</p>
              <a
                href={`tel:${hotline}`}
                className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-300 text-pink-700 font-semibold rounded-lg hover:from-pink-100 hover:to-rose-100 text-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{hotline}</span>
              </a>
              <p className="text-[9px] text-center text-gray-500 mt-1.5">Available 9 AM - 9 PM Daily</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-4">
            <h3 className="text-base font-semibold text-gray-900">Description</h3>
            {hasDesc ? (
              looksHtml ? (
                <div
                  className="mt-2 leading-relaxed text-gray-800 text-sm break-words prose prose-sm max-w-none [&_*]:text-gray-800"
                  dangerouslySetInnerHTML={{ __html: safeDesc }}
                />
              ) : (
                <p className="mt-2 leading-relaxed text-gray-800 text-sm whitespace-pre-line break-words">
                  {safeDesc}
                </p>
              )
            ) : (
              <p className="mt-2 text-gray-500 text-sm">No description available.</p>
            )}
          </div>
        </div>

        {/* Desktop Layout (unchanged) */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
          {/* LEFT: Image + Thumbs + Description */}
          <div className="bg-white rounded-2xl text-black sm:rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-pink-100 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4">
            <div
              id={`main-img-box-${product._id}`}
              className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5FDF8] to-[#F5FDF8] shadow-inner"
            >
              {finalGallery[0] ? (
                <Image
                  src={finalGallery[0]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-white" />
                </div>
              )}
            </div>

            <div className="[&_div]:mb-0">
              <ProductThumbs
                title={product.title}
                mainBoxId={`main-img-box-${product._id}`}
                images={finalGallery}
              />
            </div>

            <div className="mt-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Description
              </h3>
              {hasDesc ? (
                looksHtml ? (
                  <div
                    className="mt-2 leading-relaxed text-gray-800 break-words prose prose-sm max-w-none [&_*]:text-gray-800"
                    dangerouslySetInnerHTML={{ __html: safeDesc }}
                  />
                ) : (
                  <p className="mt-2 leading-relaxed text-gray-800 whitespace-pre-line break-words">
                    {safeDesc}
                  </p>
                )
              ) : (
                <p className="mt-2 text-gray-500">No description available.</p>
              )}
            </div>
          </div>

          {/* RIGHT: Info + Actions */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-pink-100 p-5 sm:p-6 md:p-7 lg:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.25rem] font-bold text-gray-900 break-words leading-tight tracking-tight">
              {product.title}
            </h1>

            <div className="mt-4 sm:mt-5 flex flex-wrap items-end gap-2.5 sm:gap-3">
              <div className="text-3xl sm:text-4xl md:text-4xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                ৳{product.price.toFixed(2)}
              </div>
              {hasDiscount && typeof product.compareAtPrice === "number" ? (
                <div className="text-lg sm:text-xl md:text-2xl text-gray-400 line-through font-semibold">
                  ৳{product.compareAtPrice.toFixed(2)}
                </div>
              ) : null}
              {hasDiscount ? (
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border-2 border-pink-300 shadow-sm">
                  Special Offer
                </span>
              ) : null}
              <span className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-300 shadow-sm">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                {product.stock && product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="mt-6 sm:mt-7">
              <ProductActions product={product} hotline={hotline} />
            </div>

            <div className="mt-6 sm:mt-7 p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 rounded-xl sm:rounded-2xl border-2 border-pink-200 shadow-sm">
              <div className="flex items-start gap-2 sm:gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-[#167389] flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
                  All our products are 100% authentic and of premium quality.
                  Specially curated collection for your beauty and care needs.
                </p>
              </div>
              <div className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 break-words">
                <span className="font-semibold text-gray-800">Category:</span>{" "}
                {product.categorySlug ? (
                  <Link
                    className="text-[#167389] hover:text-pink-700 font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded inline-block"
                    href={`/products?category=${product.categorySlug}`}
                  >
                    {product.categorySlug}
                  </Link>
                ) : (
                  <span className="text-gray-500">Not Available</span>
                )}
              </div>
            </div>

            <div className="mt-6 sm:mt-7">
              <a
                href={`tel:${hotline}`}
                className="inline-flex items-center justify-center gap-2 sm:gap-2.5 w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-[#167389] to-[#167389] text-white font-bold rounded-xl sm:rounded-2xl hover:from-cyan-200 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 text-sm sm:text-base"
              >
                <Phone className="w-5 h-5 sm:w-5 sm:h-5" />
                <span>Hotline: {hotline}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12 sm:mt-14 md:mt-16 lg:mt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 md:mb-10 gap-3 sm:gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-gray-900 leading-tight">
                  Related Products
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 sm:mt-2 font-medium">
                  Your Favorite Collections
                </p>
              </div>
              <Link
                href={
                  product.categorySlug
                    ? `/products?category=${product.categorySlug}`
                    : "/products"
                }
                className="text-[#167389] font-bold hover:text-pink-700 transition-colors flex items-center gap-1.5 sm:gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded text-sm sm:text-base"
                aria-label="See all related products"
              >
                <span>See All</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-fr items-stretch gap-3 sm:gap-4 md:gap-5 lg:gap-6"
              aria-label="Related products"
            >
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
