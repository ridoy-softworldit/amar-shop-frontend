// src/components/PromoList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import React, { useEffect, useState } from "react";

type PromoCard = {
  _id: string;
  title?: string;
  image?: string;
  slug?: string;
  active?: boolean;
  priority?: number;
  // optional: যদি backend category populate করে
  category?: { _id: string; title?: string; slug?: string } | string;
};

export default function PromoList() {
  const [list, setList] = useState<PromoCard[]>([]);

  useEffect(() => {
    fetch("/api/promocard")
      .then((r) => r.json())
      .then((data: unknown) => {
        // রেসপন্স কখনো সরাসরি array, কখনো {data: [...]}
        const arr = Array.isArray(data)
          ? data
          : (data as any)?.data && Array.isArray((data as any).data)
            ? (data as any).data
            : [];
        setList(arr as PromoCard[]);
      })
      .catch(() => setList([]));
  }, []);

  return (
    <div>
      <h3>Promo Cards</h3>
      <div className="grid grid-cols-3 gap-3">
        {list.map((p) => (
          <div key={p._id} className="border p-2 rounded">
            {p.image ? (
              <Image
                src={p.image}
                alt={p.title ?? "promo"}
                width={400}
                height={144}
                className="w-full h-36 object-cover"
              />
            ) : (
              <div className="w-full h-36 bg-gray-100 grid place-items-center text-sm text-gray-500">
                No image
              </div>
            )}
            <div className="mt-2">{p.title ?? "Untitled"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
