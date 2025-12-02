"use client";
import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ChevronRight, ShoppingBag } from "lucide-react";
import type { Category } from "@/lib/schemas";

interface Props {
  categories: Category[];
}

function MobileCategoriesBase({ categories }: Props) {
  if (!categories?.length) return null;

  return (
    <div className="sm:hidden">
      {" "}
      {/* <= 639px only */}
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="text-[#167389]" size={16} />
          <h3 className="text-xl font-bold text-[#167389]">Categories</h3>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-0.5 text-sm font-semibold text-[#167389] hover:text-rose-600"
        >
          View All <ChevronRight size={14} />
        </Link>
      </div>
      {/* Strip */}
      <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2.5 pb-1">
          {categories.map((cat, i) => (
            <Link
              key={cat._id}
              href={`/c/${cat.slug}`}
              className=" group h-[150px] rounded-md border border-gray-200 bg-white p-1 flex flex-col items-stretch justify-start hover:shadow-md hover:border-cyan-300 transition"
            >
              <div className=" relative basis-[90%] rounded-md overflow-hidden bg-gray-50">
                <Image
                  src={cat.image || "/placeholder.png"}
                  alt={cat.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 30vw, 20vw"
                  // FIX: Add error handling for broken images
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />
              </div>
              <p className="basis-[10%] flex items-center justify-center text-[13px] font-semibold text-gray-800 text-center p-2  ">
                {cat.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const MobileCategories = memo(MobileCategoriesBase);
