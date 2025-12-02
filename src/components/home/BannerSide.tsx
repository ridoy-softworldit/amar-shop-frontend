// src/components/home/BannerSide.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cldFill } from "@/lib/cdn";

type Banner = { _id: string; image: string; title?: string; subtitle?: string };

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function BannerSide() {
  const [items, setItems] = useState<Banner[]>([]);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${API}/banners?position=side&status=ACTIVE`, {
        cache: "no-store",
      });
      const j = await r.json();
      setItems(Array.isArray(j?.data) ? j.data : []);
    })();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {items.slice(0, 2).map((b) => (
        <div
          key={b._id}
          className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white aspect-[4/5]"
        >
          <Image
            src={cldFill(b.image, 600, 750)}
            alt={b.title || "Promo"}
            fill
            className="object-cover"
          />
          {b.title && (
            <div className="absolute left-2 bottom-2 bg-white/85 rounded-lg px-2 py-1 text-xs">
              <div className="font-semibold text-[#167389]">{b.title}</div>
              {b.subtitle && <div className="text-gray-600">{b.subtitle}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
