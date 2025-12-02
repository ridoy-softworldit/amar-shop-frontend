"use client";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShoppingBag } from "lucide-react";
import type { Category } from "@/lib/schemas";
import { memo, useState, useEffect, useRef } from "react";

interface Props {
  categories: Category[];
  loading: boolean;
}

function DesktopSidebarBase({ categories, loading }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <aside className="hidden lg:block">
        <div className="desktop-sidebar h-full">
          <div className="desktop-sidebar__header">
            <Sparkles size={18} /> Categories
          </div>
          <div className="desktop-sidebar__content">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`safe-${i}`} className="desktop-sidebar__skeleton" />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky">
        <div className="desktop-sidebar h-full">
          <div className="desktop-sidebar__header">
            <Sparkles size={18} /> Categories
          </div>
          <div className="desktop-sidebar__content">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`load-${i}`}
                    className="desktop-sidebar__skeleton"
                  />
                ))
              : categories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/c/${c.slug}`}
                    className=" group h-[150px] rounded-md border border-gray-200 bg-white p-1 flex flex-col items-stretch justify-start hover:shadow-md hover:border-cyan-300 transition"
                  >
                    <div className=" relative basis-[90%] rounded-md overflow-hidden bg-gray-50">
                                      <Image
                                        src={c.image || "/placeholder.png"}
                                        alt={c.title}
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
                                      {c.title}
                                    </p>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export const DesktopSidebar = memo(DesktopSidebarBase);
