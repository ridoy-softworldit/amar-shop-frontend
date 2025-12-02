"use client";

import Image from "next/image";
import Link from "next/link";

export default function SideBanner() {
  const promos = [
    {
      id: 1,
      title: "💖 Exclusive Offer",
      image: "/promo1.jpg",
      link: "/category/beauty",
    },
    {
      id: 2,
      title: "✨ New Arrivals",
      image: "/promo2.jpg",
      link: "/products",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {promos.map((promo) => (
        <Link
          key={promo.id}
          href={promo.link}
          className="relative h-[180px] md:h-[250px] rounded-2xl overflow-hidden shadow-md group"
        >
          <Image
            src={promo.image}
            alt={promo.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-200/40 to-transparent group-hover:from-rose-300/30 transition-all" />
          <div className="absolute bottom-3 left-4 text-rose-700 font-semibold text-lg drop-shadow">
            {promo.title}
          </div>
        </Link>
      ))}
    </div>
  );
}
