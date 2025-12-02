
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cldFill } from "@/lib/cdn";

type Banner = {
  _id: string;
  image: string;
  title?: string;
  subtitle?: string;
  discount?: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function BannerHero() {
  const [items, setItems] = useState<Banner[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${API}/banners?position=hero&status=ACTIVE`, {
        cache: "no-store",
      });
      const j = await r.json();
      setItems(Array.isArray(j?.data) ? j.data : []);
    })();
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white
                    aspect-[21/9] sm:aspect-[16/9]"
    >
      {" "}
      {/* <-- height auto, gap নেই */}
      {items.map((b, idx) => (
        <Image
          key={b._id}
          src={cldFill(b.image, 1920, 720)}
          alt={b.title || "Banner"}
          fill
          priority={idx === 0}
          className={`object-cover transition-all duration-700
                      ${idx === i ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
        />
      ))}
      {items[i] && (
        <div
          className="absolute left-3 sm:left-6 bottom-3 sm:bottom-6 bg-white/85 backdrop-blur
                        rounded-xl px-3 py-2 shadow max-w-[80%]"
        >
          <div className="text-[#167389] font-bold leading-tight">
            {items[i].title}
          </div>
          <div className="text-gray-600 text-xs sm:text-sm">
            {items[i].subtitle}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 right-3 flex gap-1.5">
        {items.map((_, d) => (
          <span
            key={d}
            className={`w-2 h-2 rounded-full ${d === i ? "bg-rose-600" : "bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
