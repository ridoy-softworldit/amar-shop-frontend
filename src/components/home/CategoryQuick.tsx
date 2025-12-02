"use client";
import Link from "next/link";
import Image from "next/image";

import type { Category } from "@/types";

export default function CategoryQuick({
  categories,
  loading,
}: {
  categories: Category[];
  loading: boolean;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
     
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : categories.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c._id}
              href={`/products?category=${c.slug}`}
              className="group block bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow"
              aria-label={`Browse ${c.title}`}
            >
              <div className="relative aspect-square bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl mb-3 overflow-hidden">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl">
                    📦
                  </span>
                )}
              </div>
              <h3 className="text-center font-semibold text-gray-800 group-hover:text-emerald-600">
                {c.title}
              </h3>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 text-center text-gray-600">
          Categories not available.
        </div>
      )}
    </section>
  );
}
