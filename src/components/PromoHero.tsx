/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/components/PromoHero.tsx
import Image from "next/image";
import React from "react";

export default function PromoHero({
  title,
  image,
  category,
}: {
  title: string;
  image?: string;
  category?: any;
}) {
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-sm">
      <div className="relative w-full h-56 md:h-96">
        {image ? (
          <Image src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
        <div className="absolute left-4 bottom-4 bg-black/50 text-white p-3 rounded">
          <h2 className="text-lg md:text-2xl font-semibold">{title}</h2>
          {category && (
            <div className="text-sm opacity-80">{category.name}</div>
          )}
        </div>
      </div>
    </div>
  );
}
