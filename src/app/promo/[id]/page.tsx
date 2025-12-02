"use client";
import React from "react";
import Image from "next/image";
import PromoHero from "@/components/PromoHero";
import TrendingGrid from "@/components/home/TrendingGrid";
import ManufacturerBannerSlider from "@/components/ManufacturerBannerSlider";
import ProductCard from "@/components/ProductCard";

import type { AppProduct } from "@/types/product";
import { useGetPromoProductsQuery } from "@/store/promocardApi";

export default function PromoPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data, isLoading, isError, isSuccess } = useGetPromoProductsQuery({
    id,
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (isError) return <div className="p-4 text-red-600">Failed to load</div>;
  if (!isSuccess || !data) return <div className="p-4">No data</div>;

  const { promo, category, products } = data; // products is AppProduct[]

  return (
    <div className="container mx-auto px-4">
      <PromoHero
        title={promo?.title || "Promo"}
        image={promo?.image || "/images/placeholder.png"}
        category={category}
      />

      <div className="my-6">
        <div className="w-full h-52 md:h-72 bg-gray-100 rounded-lg overflow-hidden relative">
          {promo?.image ? (
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              No Image
            </div>
          )}
        </div>
      </div>

      <TrendingGrid products={products} />

      <div className="my-6">
        <ManufacturerBannerSlider />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {products.length > 0 ? (
          products.map((p: AppProduct) => (
            <ProductCard key={p._id} product={p} />
          ))
        ) : (
          <div className="col-span-full text-center py-6 text-gray-500">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
