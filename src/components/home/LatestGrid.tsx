// src/components/home/LatestGrid.tsx
import Link from "next/link";
import Image from "next/image";
import NewArrivalsMobile from "@/components/home/NewArrivalsMobile"; // ensure this path exists
import { fetchProducts } from "@/services/catalog";
import { ZProduct, type Product } from "@/lib/schemas";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#fdf2f8'/><text x='50%' y='50%' text-anchor='middle' fill='#ec4899' font-size='20' font-family='Arial'>✨ Product</text></svg>`
  );

type Props = {
  title?: string;
  limit?: number;
};

export default async function LatestGrid({
  title = "New Arrivals",
  limit = 8,
}: Props) {
  const res = await fetchProducts({ sort: "createdAt:desc", limit });
  const items = Array.isArray(res)
    ? (res.map((p) => ZProduct.parse(p)) as Product[])
    : Array.isArray(res.data)
      ? (res.data.map((p) => ZProduct.parse(p)) as Product[])
      : [];

  return (
    <section className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Fresh picks just added
          </p>
        </div>

        <Link
          href="/search?sort=createdAt%3Adesc"
          className="text-sm sm:text-base font-medium text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1 group "
        >
          View all
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* ========= MOBILE: New Arrivals (client component) ========= */}
      {/* This wrapper is visible only on small screens (lg:hidden). */}
      <div className="block lg:hidden mb-4">
        {/* Debug: show items count to ensure server returned data */}
        <div className="text-xs text-gray-500 mb-2">
          Debug: items count = {items.length}
        </div>

        {/* Render client mobile component — showCount controls how many cards (2 or 4) */}
        <NewArrivalsMobile items={items} showCount={4} />
      </div>

      {/* ========= DESKTOP: unchanged grid ========= */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {items.map((p) => {
            const cover =
              p.image ??
              (Array.isArray(p.images) ? p.images[0] : undefined) ??
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

            return (
              <Link
                key={p._id}
                href={`/products/${encodeURIComponent(p.slug)}`}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                  <Image
                    src={cover}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {showCompare && discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      {discount}% OFF
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-2.5 py-1 rounded-full shadow-md">
                    <span className="text-xs font-bold">NEW</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug group-hover:text-pink-600 transition-colors min-h-[2.8rem]">
                    {p.title}
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      ৳{p.price.toLocaleString()}
                    </span>
                    {showCompare && (
                      <span className="text-sm sm:text-base text-gray-400 line-through">
                        ৳{p.compareAtPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-pink-600 font-medium inline-flex items-center gap-1">
                      Discover more
                      <svg
                        className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {items.length === 0 && (
            <div className="col-span-full text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-50 mb-4">
                <svg
                  className="w-8 h-8 text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-base sm:text-lg text-gray-600 font-medium">
                No products available yet
              </p>
              <p className="text-sm text-gray-500 mt-2">
                New arrivals coming soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
