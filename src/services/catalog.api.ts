/* eslint-disable @typescript-eslint/no-explicit-any */
/* services/catalog.api.ts */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  fetchBanners,
  fetchCategories,
  fetchProducts,
  type ProductsQuery,
} from "@/services/catalog";
import type { Product, Category } from "@/lib/schemas";
import type { Banner } from "@/types/banner";

/**
 * catalogApi - central RTK Query API for products/categories/banners
 * - Adds getProductsPaginated which returns a normalized page shape:
 *   { items: Product[], total, page, limit, pages }
 *
 * Notes:
 * - This uses your existing fetchProducts() helper under the hood.
 * - No backend changes required.
 */

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1",
  }),
  tagTypes: ["Product", "Category", "Banner"],
  endpoints: (builder) => ({
    /* ---------- Categories (unchanged) ---------- */
    getCategories: builder.query<{ data: Category[] }, void>({
      async queryFn(_arg, _api, _extra, _baseQuery) {
        try {
          const res = await fetchCategories();
          // Keep original wrapper shape for backward compatibility
          return { data: { data: res.data } };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({
                type: "Category" as const,
                id: c._id,
              })),
              { type: "Category" as const, id: "LIST" },
            ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    /* ---------- Backward-compatible getProducts (keeps older shape) ---------- */
    // This is left for components that rely on previous shape/behavior.
    getProducts: builder.query<
      // return boxed normalized page shape for safety
      {
        items: Product[];
        total: number;
        page: number;
        limit: number;
        pages: number;
      },
      ProductsQuery | void
    >({
      async queryFn(arg = {}, _api, _extra, _baseQuery) {
        try {
          const res = await fetchProducts(arg as ProductsQuery);

          // fetchProducts may return { ok, data, pageInfo } or direct array
          // Try to read many common shapes
          const raw = (res as any) ?? {};
          // Candidate for boxed payload:
          const candidate = raw.data ?? raw;

          // If candidate already looks like { items, total, page, limit, pages }
          const boxed =
            candidate &&
            typeof candidate === "object" &&
            (Array.isArray(candidate.items) || Array.isArray(candidate.data))
              ? (candidate as any)
              : {
                  // fallback: if res.data is an array
                  items: Array.isArray((raw as any)?.data)
                    ? (raw as any).data
                    : Array.isArray(raw)
                      ? raw
                      : [],
                  total: Number(((raw as any)?.total ?? 0) || 0),
                  page: Number((arg as any)?.page ?? 1),
                  limit: Number(
                    (arg as any)?.limit ??
                      (Array.isArray((raw as any)?.data)
                        ? (raw as any).data.length
                        : 24)
                  ),
                  pages: Number((raw as any)?.pages ?? 1),
                };

          const items = Array.isArray(boxed.items) ? boxed.items : [];
          const total = Number(boxed.total ?? items.length);
          const page = Number(boxed.page ?? arg?.page ?? 1);
          const limit = Number(boxed.limit ?? arg?.limit ?? items.length ?? 24);
          const pages = Number(
            boxed.pages ??
              (limit > 0 ? Math.max(1, Math.ceil(total / (limit || 1))) : 1)
          );

          return { data: { items, total, page, limit, pages } };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result.items)
          ? [
              ...result.items.map((p: any) => ({
                type: "Product" as const,
                id: p._id,
              })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
      keepUnusedDataFor: 30,
    }),

    /* ---------- NEW: getProductsPaginated (recommended) ---------- */
    // This returns a consistent, predictable paginated shape that UI can rely on
    getProductsPaginated: builder.query<
      {
        items: Product[];
        total: number;
        page: number;
        limit: number;
        pages: number;
      },
      ProductsQuery | void
    >({
      async queryFn(arg = {}, _api, _extra, _baseQuery) {
        try {
          const res = await fetchProducts(arg as ProductsQuery);
          // fetchProducts() returns { ok, data, pageInfo } OR other shapes
          const raw = (res as any) ?? {};
          const candidate = raw.data ?? raw;

          // Normalize into predictable page object
          let items: any[] = [];
          let total = 0;
          let page = Number(arg?.page ?? 1);
          let limit = Number(arg?.limit ?? 24);
          let pages = 1;

          if (Array.isArray(candidate)) {
            items = candidate;
            total = candidate.length;
          } else if (candidate && typeof candidate === "object") {
            // Candidate might be { items: [...], total, page, limit, pages }
            if (Array.isArray(candidate.items)) items = candidate.items;
            else if (Array.isArray(candidate.data)) items = candidate.data;
            else if (Array.isArray(candidate.results))
              items = candidate.results;
            else {
              // Find first array in object values
              const firstArr = Object.values(candidate).find((v) =>
                Array.isArray(v)
              );
              if (Array.isArray(firstArr)) items = firstArr as any[];
            }

            total = Number(candidate.total ?? candidate.count ?? items.length);
            page = Number(candidate.page ?? arg?.page ?? page);
            limit = Number(
              candidate.limit ?? arg?.limit ?? (items.length || limit)
            );
            pages = Number(
              candidate.pages ??
                (limit > 0 ? Math.max(1, Math.ceil(total / (limit || 1))) : 1)
            );
          } else {
            // fallback if no data
            items = [];
            total = 0;
            page = Number(arg?.page ?? 1);
            limit = Number(arg?.limit ?? 24);
            pages = 1;
          }

          // ensure types
          const sanitizedItems = Array.isArray(items) ? items : [];
          const sanitizedTotal = Number(total || sanitizedItems.length || 0);
          const sanitizedPage = Number(page || 1);
          const sanitizedLimit = Number(limit || 24);
          const sanitizedPages = Number(
            pages ||
              Math.max(1, Math.ceil(sanitizedTotal / (sanitizedLimit || 1)))
          );

          return {
            data: {
              items: sanitizedItems,
              total: sanitizedTotal,
              page: sanitizedPage,
              limit: sanitizedLimit,
              pages: sanitizedPages,
            },
          };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result.items)
          ? [
              ...result.items.map((p: any) => ({
                type: "Product" as const,
                id: p._id,
              })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
      keepUnusedDataFor: 30,
    }),

    /* ---------- Banners ---------- */
    getHeroBanners: builder.query<Banner[], number | undefined>({
      async queryFn(limitArg, _api, _extra, _baseQuery) {
        try {
          const limit = typeof limitArg === "number" ? limitArg : 6;
          const res = await fetchBanners({
            position: "hero",
            status: "ACTIVE",
            limit,
          });
          return { data: res.data };
        } catch (error) {
          return { error: { status: 500, data: error } as any };
        }
      },
      providesTags: (result) =>
        result
          ? result.map((b) => ({ type: "Banner" as const, id: b._id }))
          : [],
      keepUnusedDataFor: 60,
    }),

    /* ---------- Get Product By ID ---------- */
    getProductById: builder.query<Product, string>({
      query: (productId) => `/products/id/${productId}`,
      transformResponse: (response: { ok: boolean; data: Product }) => response.data,
      providesTags: (result, error, productId) => [
        { type: "Product" as const, id: productId },
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    /* ---------- confirmOrder mutation (example) ---------- */
    confirmOrder: builder.mutation<
      { ok: boolean; updatedProducts?: Array<{ _id: string; stock: number }> },
      {
        items: Array<{ _id: string; quantity: number }>;
        payment?: any;
        customer?: any;
        totals?: any;
        idempotencyKey?: string;
      }
    >({
      query: (body) => {
        const headers: Record<string, string> = {
          "content-type": "application/json",
        };
        if (body?.idempotencyKey)
          headers["X-Idempotency-Key"] = body.idempotencyKey;
        return {
          url: "/orders",
          method: "POST",
          body,
          headers,
        };
      },
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetProductsPaginatedQuery,
  useGetHeroBannersQuery,
  useGetProductByIdQuery,
  useConfirmOrderMutation,
  useLazyGetProductsPaginatedQuery,
} = catalogApi;
