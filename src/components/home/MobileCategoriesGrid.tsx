"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight as ArrowRight } from "lucide-react";
import type { Category } from "@/lib/schemas";
import { useState, useEffect } from "react";

type Props = { categories: Category[]; loading?: boolean; title?: string };

export default function MobileCategoriesGrid({
  categories,
  loading = false,
  title = "Shop by Categories",
}: Props) {
  const [isMounted, setIsMounted] = useState(false);

  // FIX: Safe useEffect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // FIX: Safe early return
  if (!isMounted) {
    return (
      <section className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#167389]" size={20} />
            <h2 className="text-lg font-bold text-[#167389]">{title}</h2>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="h-[156px] rounded-md border border-gray-200 bg-white p-3 flex flex-col items-center justify-start"
            >
              <div className="relative w-full h-[80%] rounded-md bg-gray-100 animate-pulse" />
              <div className="mt-2 h-3 w-20 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const items = Array.isArray(categories) ? categories.slice(0, 6) : [];

  return (
    <section className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#167389]" size={20} />
          <h2 className="text-lg font-bold text-[#167389]">{title}</h2>
        </div>
        {!loading && (
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#167389] hover:text-rose-600 transition"
          >
            View All <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="h-[156px] rounded-md border border-gray-200 bg-white p-3 flex flex-col items-center justify-start"
              >
                <div className="relative w-full h-[80%] rounded-md bg-gray-100 animate-pulse" />
                <div className="mt-2 h-3 w-20 rounded bg-gray-100 animate-pulse" />
              </div>
            ))
          : items.map((cat) => (
              <Link
                key={`cat-${cat._id ?? cat.slug}`}
                href={`/c/${cat.slug}`}
                className="mcg-card group h-[156px] rounded-md border border-gray-200 bg-white p-2 flex flex-col items-stretch justify-start hover:shadow-md hover:border-cyan-300 transition"
                // FIX: Add onClick prevent default to avoid navigation issues
                onClick={(e) => {
                  if (!cat.slug) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="mcg-img relative basis-[80%] rounded-md overflow-hidden bg-gray-50">
                  <Image
                    src={cat.image || "/placeholder.png"}
                    alt={cat.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 33vw, 20vw"
                    // FIX: Add error handling for broken images
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </div>
                <p className="basis-[20%] flex items-center justify-center text-[13px] font-extrabold text-gray-800 text-center px-1 leading-tight line-clamp-2">
                  {cat.title}
                </p>
              </Link>
            ))}
      </div>

      {!loading && categories.length > 6 && (
        <div className="mt-4 flex justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 hover:border-[#167389] hover:text-[#167389] transition"
          >
            View More <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
}
