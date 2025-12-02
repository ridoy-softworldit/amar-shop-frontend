/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/store/api/promocardApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AppProduct } from "@/types/product";

export interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export interface Promo {
  _id: string;
  title: string;
  category: Category;
  image?: string;
  slug?: string;
  active?: boolean;
  priority?: number;
}

export interface PromoProductsResponseRaw {
  promo: Promo;
  category: Category;
  products: any[]; // raw API product objects – we'll transform
}

export interface PromoProductsResponse {
  promo: Promo;
  category: Category;
  products: AppProduct[]; // transformed / normalized
}

export interface ManufacturerBanner {
  _id: string;
  manufacturer: { _id: string; name?: string };
  image: string;
  link?: string;
  active?: boolean;
  order?: number;
}

/** Helper: normalize raw API product -> AppProduct */
function normalizeProduct(apiP: any): AppProduct {
  const title = apiP.title ?? apiP.name ?? apiP.productName ?? "Untitled";
  const slug =
    apiP.slug ??
    (typeof title === "string"
      ? title.toLowerCase().replace(/\s+/g, "-")
      : apiP._id);
  const images = apiP.images ?? (apiP.image ? [apiP.image] : []);
  const image =
    images && images.length
      ? images[0]
      : (apiP.image ?? "/images/placeholder.png");
  const stock =
    apiP.stock !== undefined
      ? Number(apiP.stock)
      : apiP.quantity !== undefined
        ? Number(apiP.quantity)
        : apiP.inventory !== undefined
          ? Number(apiP.inventory)
          : 0;

  return {
    _id: apiP._id ?? apiP.id ?? String(Math.random()).slice(2, 10),
    title: String(title),
    slug: String(slug),
    price: Number(apiP.price ?? apiP.salePrice ?? 0),
    status: apiP.status ?? "ACTIVE",
    description: apiP.description ?? apiP.desc ?? "",
    image: image,
    images: images,
    compareAtPrice: apiP.compareAtPrice
      ? Number(apiP.compareAtPrice)
      : undefined,
    stock,
    sku: apiP.sku ?? apiP.SKU,
    vendor: apiP.vendor ?? apiP.manufacturerName,
    createdAt: apiP.createdAt ?? apiP.created_at,
    updatedAt: apiP.updatedAt ?? apiP.updated_at,
  };
}

export const promocardApi = createApi({
  reducerPath: "promocardApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:5000/api/v1",
  }),
  endpoints: (builder) => ({
    getPromoProducts: builder.query<
      PromoProductsResponse,
      { id: string; limit?: number; skip?: number }
    >({
      query: ({ id, limit = 24, skip = 0 }) =>
        `/promocard/${id}/products?limit=${limit}&skip=${skip}`,
      transformResponse: (response: PromoProductsResponseRaw) => {
        const promo =
          response?.promo ??
          ({ _id: "", title: "", category: { _id: "", name: "" } } as Promo);
        const category =
          response?.category ??
          promo.category ??
          ({ _id: "", name: "" } as Category);
        const productsRaw = Array.isArray(response?.products)
          ? response.products
          : [];
        const products = productsRaw.map(normalizeProduct);
        return { promo, category, products } as PromoProductsResponse;
      },
      // optional: set keepUnusedDataFor, providesTags etc
    }),
    getManufacturerBanners: builder.query<ManufacturerBanner[], void>({
      query: () => `/manufacturer-banners`,
    }),
  }),
});

export const { useGetPromoProductsQuery, useGetManufacturerBannersQuery } =
  promocardApi;
