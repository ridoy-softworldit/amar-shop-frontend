/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/schemas";

type Props = { categories: Category[]; loading?: boolean };

export default function DesktopSidebar({ categories = [], loading }: Props) {
  return (
    <aside className="desktop-sidebar">
      <div className="desktop-sidebar__header">
        <span>Categories</span>
      </div>

      <div className="desktop-sidebar__content">
        {/* সমান উচ্চতার কার্ড: 3/4 ইমেজ + 1/4 টাইটেল */}
        {(loading ? Array.from({ length: 12 }) : categories).map(
          (c: any, i: number) => {
            const slug = c?.slug ?? "";
            const title = c?.title ?? "";
            const image = c?.images?.[0] ?? "";

            return loading ? (
              <div
                key={`sk-${i}`}
                className="grid grid-rows-[3fr_1fr] rounded-lg bg-white"
              >
                <div className="rounded-md bg-gray-100 animate-pulse" />
                <div className="h-3 mx-2 mt-1 rounded bg-gray-100 animate-pulse" />
              </div>
            ) : (
              <Link
                key={c._id ?? slug}
                href={`/products?category=${encodeURIComponent(slug)}`}
                className="group grid grid-rows-[3fr_1fr] rounded-md bg-white hover:bg-red-50/60 transition-colors p-1.5 border border-red-700"
                aria-label={`Browse ${title}`}
              >
                {/* 3/4: ছবি ফুল-উইডথ/হাইট */}
                <div className="relative w-full h-full overflow-hidden rounded-md">
                  {image ? (
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes="(min-width:1024px) 120px, 100vw"
                      className="object-cover object-center group-hover:scale-[1.03] transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>

                {/* 1/4: বোল্ড টাইটেল */}
                <div className="flex items-center justify-center px-1">
                  <p className="text-[12px] font-semibold text-gray-800 text-center leading-tight line-clamp-2">
                    {title}
                  </p>
                </div>
              </Link>
            );
          }
        )}
      </div>
    </aside>
  );
}
