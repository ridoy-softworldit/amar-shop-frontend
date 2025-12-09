/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ManufacturerHeroSlider from "./ManufacturerHeroSlider";
import ManufacturerProducts from "./ManufacturerProducts";
import {
  fetchProducts,
  fetchManufacturers,
} from "@/services/catalog";
import type { Product } from "@/types";
import { Building2 } from "lucide-react";

export const revalidate = 30;

interface ManufacturerViewProps {
  slug: string;
}

export default async function ManufacturerView({ slug }: ManufacturerViewProps) {
  // fetch manufacturers first to find actual brand name
  const manufacturersRes = await fetchManufacturers().catch(() => ({ ok: true, data: [] }));
  const manufacturers: any[] = (manufacturersRes && (manufacturersRes as any).data) || [];
  const activeManufacturer = manufacturers.find((m) => m.slug === slug);
  const brandName = activeManufacturer?.title || decodeURIComponent(slug).replace(/-/g, ' ');
  
  // fetch products with actual brand name
  const productsRes = await fetchProducts({ brand: brandName, limit: 8 }).catch(() => ({
    ok: true,
    data: [] as Product[],
  }));

  const rawProducts = (productsRes && (productsRes as any).data) || [];
  const initialProducts: Product[] = Array.isArray(rawProducts) 
    ? rawProducts 
    : Array.isArray(rawProducts?.items) 
    ? rawProducts.items 
    : [];
  const title = brandName;

  const banners = activeManufacturer?.image 
    ? [{ _id: activeManufacturer._id, title: title, image: activeManufacturer.image }]
    : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 xs:px-5 sm:px-6 lg:px-8 py-8 md:py-12 pt-20 space-y-6">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#167389] text-white rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 truncate uppercase" style={{textTransform: 'uppercase'}}>
                {title?.toUpperCase() || ''}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Showing {initialProducts.length} of latest products
              </p>
            </div>
          </div>
        </div>

        {/* Products grid (client-managed pagination) */}
        <section>
          <ManufacturerProducts
            initialProducts={initialProducts}
            manufacturerSlug={slug}
            brandName={brandName}
          />
        </section>
      </div>
    </div>
  );
}