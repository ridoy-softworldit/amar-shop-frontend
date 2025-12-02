// src/components/ManufacturerBanner.tsx
import Image from "next/image";
import React, { useState, useEffect } from "react";

type Manufacturer = { _id?: string; name?: string } | string;
type ManufacturerBannerType = {
  _id: string;
  image: string;
  manufacturer?: Manufacturer;
  link?: string;
  active?: boolean;
  order?: number;
};

export default function ManufacturerBanner() {
  const [banners, setBanners] = useState<ManufacturerBannerType[]>([]);

  useEffect(() => {
    fetch("/api/manufacturer-banners")
      .then((r) => r.json())
      .then((data) => {
        // safety: ensure it's an array before set
        setBanners(Array.isArray(data) ? data : []);
      })
      .catch(() => setBanners([]));
  }, []);

  return (
    <div>
      <h3>Manufacturer Banners</h3>
      <div className="grid grid-cols-3 gap-3">
        {banners.map((b) => (
          <div key={b._id} className="border rounded p-2">
            <Image
              src={b.image}
              alt={
                b.manufacturer && typeof b.manufacturer !== "string"
                  ? (b.manufacturer.name ?? "banner")
                  : "banner"
              }
              width={400}
              height={144}
              className="w-full h-36 object-cover"
            />
            <div className="mt-1 font-medium">
              {typeof b.manufacturer === "object"
                ? b.manufacturer?.name
                : undefined}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
