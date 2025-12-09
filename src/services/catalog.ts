/* eslint-disable @typescript-eslint/no-explicit-any */
/* lib/fetchProducts.ts */

import {
  ZCategoriesResponse,
  ZProductsResponse,
  ZOkProduct,
  ZProduct,
  ZCategory,
} from "@/lib/schemas";
import type { Banner } from "@/types/banner";
import type { Paginated } from "@/types/index"; // adjust if needed

export type BannerPosition = "hero" | "side";
export type BannerStatus = "ACTIVE" | "HIDDEN";

/* ----------------------------- API Base Setup ---------------------------- */
const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

const API_BASE = API || "https://amar-shop-backend.vercel.app";

if (!API) {
  console.warn("⚠️ API URL missing — using fallback", API_BASE);
}

/* ------------------------------ Types ----------------------------------- */
export type ProductsQuery = {
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  discounted?: "true" | "false";
  featured?: "true" | "false";
  limit?: number;
  page?: number;
  status?: "ACTIVE" | "DRAFT" | "HIDDEN";
  sort?: string;
  tag?: string;
};

type Query =
  | Record<string, string | number | boolean | undefined | null>
  | null
  | undefined;

/* -------------------------- URL builder util ----------------------------- */
function buildURL(path: string, params?: Query) {
  const usp = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && String(v).length > 0) {
        usp.set(k, String(v));
      }
    }
  }
  return `${API_BASE}${path}${usp.toString() ? `?${usp.toString()}` : ""}`;
}

/* -------------------------------------------------------------------------- */
/* ⚙️ OPTIMIZED FETCH: in-memory cache + dedupe + small retry                  */
/* -------------------------------------------------------------------------- */

const requestCache = new Map<string, Promise<any>>();
const cacheTTL = 5000; // short-term cache to avoid duplicate bursts

async function getJSON<T>(path: string, params?: Query): Promise<T> {
  const url = buildURL(path, params);

  if (requestCache.has(url)) {
    return requestCache.get(url)!;
  }

  const fetchPromise = (async () => {
    let attempt = 0;
    while (attempt < 2) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error(`❌ API Error [${res.status}] ${url} - ${text}`);
          throw new Error(`${path} failed: ${res.status}`);
        }

        const data = (await res.json()) as T;
        return data;
      } catch (err) {
        attempt++;
        if (attempt >= 2) {
          console.error(`Network Error after retries: ${url}`, err);
          throw err;
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    throw new Error("Unreachable");
  })();

  requestCache.set(url, fetchPromise);
  setTimeout(() => requestCache.delete(url), cacheTTL);
  return fetchPromise;
}

/* --------------------------- Normalizers --------------------------------- */

function __normalizeProductsShape(raw: unknown): {
  arr: unknown[];
  pageInfo?: unknown;
} {
  let arr: unknown[] = [];
  let pageInfo: unknown | undefined;

  const rawObj = raw as Record<string, unknown>;
  const rawData =
    rawObj && "data" in rawObj ? (rawObj as { data: unknown }).data : undefined;

  if (Array.isArray(rawData)) {
    arr = rawData;
    pageInfo = (rawObj as Record<string, unknown>)?.pageInfo;
  } else if (rawData && typeof rawData === "object") {
    const box = rawData as Record<string, unknown>;
    arr =
      (box.items as unknown[]) ??
      (box.docs as unknown[]) ??
      (box.data as unknown[]) ??
      (box.results as unknown[]) ??
      (Object.values(box).find((v) => Array.isArray(v)) as unknown[]) ??
      [];
    const pSrc = (rawObj as Record<string, unknown>)?.pageInfo ?? {
      page: (box as Record<string, unknown>)?.page,
      limit: (box as Record<string, unknown>)?.limit,
      total: (box as Record<string, unknown>)?.total,
      hasNext: (box as Record<string, unknown>)?.hasNext,
    };
    pageInfo = pSrc;
  } else if (Array.isArray(raw)) {
    arr = raw as unknown[];
  } else if (raw && typeof raw === "object") {
    const maybe = Object.values(raw);
    const firstArr = (maybe as unknown[]).find((v) => Array.isArray(v)) ?? [];
    arr = Array.isArray(firstArr) ? firstArr : [];
  }

  if (!Array.isArray(arr)) arr = [];
  return { arr, pageInfo };
}

function normalizeCategoriesShape(raw: unknown): unknown[] {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray((obj as { data?: unknown[] }).data))
      return (obj as { data: unknown[] }).data;
    if (Array.isArray((obj as { items?: unknown[] }).items))
      return (obj as { items: unknown[] }).items;
    const arrLike = Object.values(obj).find((v) => Array.isArray(v));
    if (Array.isArray(arrLike)) return arrLike as unknown[];
  }
  if (Array.isArray(raw)) return raw as unknown[];
  return [];
}

/* ------------------------------ API functions ----------------------------- */

export async function fetchCategories() {
  try {
    const raw = await getJSON<unknown>("/categories");

    try {
      const parsed = ZCategoriesResponse.parse(raw);
      const data = parsed.data.filter((c) => c.status === "ACTIVE");
      return { ok: true as const, data };
    } catch {
      const arr = normalizeCategoriesShape(raw);
      const validated: Array<ReturnType<typeof ZCategory.parse>> = [];
      for (const item of arr) {
        const res = ZCategory.safeParse(item);
        if (res.success) validated.push(res.data);
      }
      const data = validated.filter((c) => c.status === "ACTIVE");
      return { ok: true as const, data };
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return {
      ok: true as const,
      data: [] as ReturnType<typeof ZCategory.parse>[],
    };
  }
}

export async function fetchManufacturers() {
  try {
    const raw = await getJSON<unknown>("/brands");
    const arr = normalizeCategoriesShape(raw);
    // Convert string array to manufacturer objects
    const manufacturers = arr.map((name: unknown, index: number) => ({
      _id: `brand-${index}`,
      title: String(name),
      slug: String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: "ACTIVE"
    }));
    return { ok: true as const, data: manufacturers };
  } catch (error) {
    console.error("Failed to fetch manufacturers:", error);
    return { ok: true as const, data: [] };
  }
}

export async function fetchSubcategories(categoryId?: string) {
  try {
    const params = categoryId ? { categoryId } : {};
    const raw = await getJSON<unknown>("/subcategories", params);
    const arr = normalizeCategoriesShape(raw);
    return { ok: true as const, data: arr };
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
    return { ok: true as const, data: [] };
  }
}

/* -------------------------- UPDATED fetchProducts (fixed) ------------------------ */

export async function fetchProducts(query?: ProductsQuery) {
  try {
    // normalize requested limit
    let limit = query?.limit;
    if (typeof limit === "number") {
      if (!Number.isFinite(limit) || limit <= 0) limit = undefined;
      else if (limit > 60) limit = 60;
    }

    const params: Query = {
      ...query,
      limit,
      status: query?.status ?? "ACTIVE",
    };

    // fetch raw response
    let raw: unknown;
    try {
      raw = await getJSON<unknown>("/products", params);
    } catch (e: unknown) {
      const message = (e as { message?: string }).message ?? "";
      if (message.includes('"limit"') || message.includes("VALIDATION_ERROR")) {
        raw = await getJSON<unknown>("/products", {
          ...params,
          limit: undefined,
        });
      } else {
        throw e;
      }
    }

    // extract array + page info robustly
    let arr: unknown[] = [];
    // make pageInfo permissive so assignments like {} or { total: ... } are fine
    let pageInfo: Record<string, any> | undefined = undefined;

    const maybeObj = raw as Record<string, unknown> | unknown[];

    if (maybeObj && typeof maybeObj === "object" && "data" in (maybeObj as any)) {
      const boxed = (maybeObj as any).data;
      if (Array.isArray(boxed)) {
        arr = boxed;
        pageInfo = (maybeObj as any).pageInfo ?? (maybeObj as any).meta ?? undefined;
      } else if (boxed && typeof boxed === "object") {
        arr =
          (boxed.items as unknown[]) ??
          (boxed.docs as unknown[]) ??
          (boxed.results as unknown[]) ??
          (boxed.data as unknown[]) ??
          [];
        pageInfo =
          (boxed as Record<string, unknown>)?.pageInfo ??
          (boxed as Record<string, unknown>)?.meta ??
          {
            total: (boxed as any).total,
            page: (boxed as any).page,
            limit: (boxed as any).limit,
            pages: (boxed as any).pages,
          };
      }
    } else {
      if (Array.isArray(raw)) {
        arr = raw as unknown[];
      } else if (raw && typeof raw === "object") {
        const firstArr = Object.values(raw as Record<string, unknown>).find((v) =>
          Array.isArray(v)
        );
        arr = Array.isArray(firstArr) ? (firstArr as unknown[]) : [];
        pageInfo =
          (raw as Record<string, unknown>)?.pageInfo ??
          (raw as Record<string, unknown>)?.meta ??
          {
            total: (raw as any).total,
            page: (raw as any).page,
            limit: (raw as any).limit,
            pages: (raw as any).pages,
          };
      }
    }

    if (!Array.isArray(arr)) arr = [];

    // validate items with ZProduct
    const validated: Array<ReturnType<typeof ZProduct.parse>> = [];
    for (const item of arr) {
      const res = ZProduct.safeParse(item);
      if (res.success) validated.push(res.data);
    }

    // default filter active
    let data = validated.filter((p) => p.status === "ACTIVE");

    // discounted filter client-side fallback
    if (query?.discounted === "true") {
      data = data.filter(
        (p) =>
          p.isDiscounted === true ||
          (typeof p.compareAtPrice === "number" && p.compareAtPrice > p.price)
      );
    }

    // default sort (new-first) when createdAt present
    if (!query?.sort && data.length > 0 && "createdAt" in data[0]) {
      data = [...data].sort((a, b) => {
        const aDate = (a as { createdAt?: string }).createdAt ?? "";
        const bDate = (b as { createdAt?: string }).createdAt ?? "";
        return aDate > bDate ? -1 : 1;
      });
    }

    // client-side slicing fallback if backend didn't respect limit
    const usedLimit = typeof params.limit === "number" ? params.limit : undefined;
    if (usedLimit && data.length > usedLimit) data = data.slice(0, usedLimit);

    // normalize cover image to `image`
    data = data.map((p) => {
      const cover =
        p.image ?? (Array.isArray(p.images) ? p.images[0] : undefined);
      return cover ? { ...p, image: cover } : p;
    });

    // derive canonical paging values
    const totalFromPageInfo =
      typeof (pageInfo as any)?.total === "number"
        ? (pageInfo as any).total
        : typeof (maybeObj as any)?.total === "number"
        ? (maybeObj as any).total
        : undefined;

    const pageFromPageInfo =
      typeof (pageInfo as any)?.page === "number"
        ? (pageInfo as any).page
        : typeof (maybeObj as any)?.page === "number"
        ? (maybeObj as any).page
        : 1;

    const limitFromPageInfo =
      typeof (pageInfo as any)?.limit === "number"
        ? (pageInfo as any).limit
        : typeof (maybeObj as any)?.limit === "number"
        ? (maybeObj as any).limit
        : usedLimit ?? data.length;

    const pagesFromPageInfo =
      typeof (pageInfo as any)?.pages === "number"
        ? (pageInfo as any).pages
        : totalFromPageInfo && limitFromPageInfo
        ? Math.max(1, Math.ceil(Number(totalFromPageInfo) / Number(limitFromPageInfo)))
        : 1;

    const normalized = {
      items: data,
      total: typeof totalFromPageInfo === "number" ? totalFromPageInfo : data.length,
      page: Number(pageFromPageInfo || 1),
      limit: Number(limitFromPageInfo || (usedLimit ?? data.length)),
      pages: Number(pagesFromPageInfo || 1),
    };

    return { ok: true as const, data: normalized };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      ok: true as const,
      data: { items: [] as ReturnType<typeof ZProduct.parse>[], total: 0, page: 1, limit: 0, pages: 0 },
    };
  }
}


/* ------------------------------ fetchProduct ----------------------------- */

export async function fetchProduct(slug: string) {
  try {
    const raw = await getJSON<unknown>(`/products/${encodeURIComponent(slug)}`);
    const parsed = ZOkProduct.parse(raw);
    const p = parsed.data;
    const cover =
      p.image ?? (Array.isArray(p.images) ? p.images[0] : undefined);
    return { ok: true as const, data: cover ? { ...p, image: cover } : p };
  } catch (error) {
    console.error(`Failed to fetch product ${slug}:`, error);
    return { ok: false as const, data: null };
  }
}

/* ------------------------------ Banners ---------------------------------- */
// export async function fetchBanners(params?: {
//   position?: "hero" | "side";
//   status?: "ACTIVE" | "HIDDEN";
//   limit?: number;
//   skip?: number;
//   category?: string;
// }) {
//   try {
//     const q: Query = {
//       position: params?.position,
//       status: params?.status ?? "ACTIVE",
//       limit: params?.limit,
//       skip: params?.skip,
//       category: params?.category,
//     };

//     const raw = await getJSON<unknown>("/banners", q);

//     let dataUnknown: unknown[] = [];
//     if (
//       raw &&
//       typeof raw === "object" &&
//       "data" in (raw as Record<string, unknown>)
//     ) {
//       const obj = raw as { data?: unknown };
//       dataUnknown = Array.isArray(obj.data) ? obj.data : [];
//     } else if (Array.isArray(raw)) {
//       dataUnknown = raw as unknown[];
//     } else {
//       const arrLike =
//         raw && typeof raw === "object"
//           ? Object.values(raw as Record<string, unknown>).find((v) =>
//               Array.isArray(v)
//             )
//           : undefined;
//       dataUnknown = Array.isArray(arrLike) ? (arrLike as unknown[]) : [];
//     }

//     const banners = dataUnknown.filter((b) => {
//       const st = (b as { status?: string })?.status;
//       return !st || st.toUpperCase() === "ACTIVE";
//     }) as Banner[];

//     const filtered = params?.position
//       ? banners.filter((b) => b.position === params.position)
//       : banners;

//     const categoryFiltered = params?.category
//       ? filtered.filter((b) => {
//           const cat = (b as { category?: any })?.category;
//           if (!cat) return false;
//           if (typeof cat === "string") return cat === params.category;
//           if (typeof cat === "object" && cat !== null) {
//             return (
//               (cat as { _id?: string; slug?: string }).slug ===
//                 params.category ||
//               (cat as { _id?: string; slug?: string })._id === params.category
//             );
//           }
//           return false;
//         })
//       : filtered;

//     const final =
//       params?.limit && params.limit > 0
//         ? categoryFiltered.slice(0, params.limit)
//         : categoryFiltered;

//     return { ok: true as const, data: final };
//   } catch (error) {
//     console.error("Failed to fetch banners:", error);
//     return { ok: true as const, data: [] as Banner[] };
//   }
// }

/* ------------------------------ Banners (with Fallback) ---------------------------------- */
export async function fetchBanners(params?: {
  position?: "hero" | "side";
  status?: "ACTIVE" | "HIDDEN";
  limit?: number;
  skip?: number;
  category?: string;
}) {
  try {
    const q: Query = {
      position: params?.position,
      status: params?.status ?? "ACTIVE",
      limit: params?.limit,
      skip: params?.skip,
      category: params?.category,
    };

    // 1️⃣ Try fetching actual banners first
    const raw = await getJSON<unknown>("/banners", q);

    let dataUnknown: unknown[] = [];
    if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
      const obj = raw as { data?: unknown };
      dataUnknown = Array.isArray(obj.data) ? obj.data : [];
    } else if (Array.isArray(raw)) {
      dataUnknown = raw as unknown[];
    } else {
      const arrLike =
        raw && typeof raw === "object"
          ? Object.values(raw as Record<string, unknown>).find((v) =>
              Array.isArray(v)
            )
          : undefined;
      dataUnknown = Array.isArray(arrLike) ? (arrLike as unknown[]) : [];
    }

    // 2️⃣ Filter active banners
    const banners = (dataUnknown.filter((b) => {
      const st = (b as { status?: string })?.status;
      return !st || st.toUpperCase() === "ACTIVE";
    }) || []) as Banner[];

    // 3️⃣ Optional position filter
    const filtered = params?.position
      ? banners.filter((b) => b.position === params.position)
      : banners;

    // 4️⃣ Optional category filter
    const categoryFiltered = params?.category
      ? filtered.filter((b) => {
          const cat = (b as { category?: any })?.category;
          if (!cat) return false;
          if (typeof cat === "string") return cat === params.category;
          if (typeof cat === "object" && cat !== null) {
            return (
              (cat as { _id?: string; slug?: string }).slug === params.category ||
              (cat as { _id?: string; slug?: string })._id === params.category
            );
          }
          return false;
        })
      : filtered;

    // 5️⃣ Apply limit if needed
    const final =
      params?.limit && params.limit > 0
        ? categoryFiltered.slice(0, params.limit)
        : categoryFiltered;

    // ✅ If we found banners, return them immediately
    if (final.length > 0) {
      return { ok: true as const, data: final };
    }

    // If category was specified but no banners found, return empty array
    // This allows CategoryView to use the category image as fallback
    if (params?.category) {
      return { ok: true as const, data: [] };
    }

    /* ------------------------------------------------------------------
       🚨 No banner found: Fetch fallback banner from DB (industry standard)
       ------------------------------------------------------------------ */
    console.warn("⚠️ No banners found. Loading fallback banner from DB...");

    const fallback = await getJSON<unknown>("/banners?status=ACTIVE&limit=1");

    let fallbackArr: Banner[] = [];
    if (fallback && typeof fallback === "object" && "data" in (fallback as Record<string, unknown>)) {
      const obj = fallback as { data?: Banner[] };
      fallbackArr = Array.isArray(obj.data) ? obj.data : [];
    } else if (Array.isArray(fallback)) {
      fallbackArr = fallback as Banner[];
    }

    // 6️⃣ Select only the latest fallback banner (or dummy if none)
    const fallbackBanner =
      fallbackArr.length > 0
        ? fallbackArr[0]
        : ({
            _id: "fallback",
            title: "Welcome to Amar Shop",
            subtitle: "Best deals & offers, everyday!",
            image:
              "https://res.cloudinary.com/dtges64tg/image/upload/v1762065479/Amarshop_default_fallback.webp",
            discount: "0%",
            position: "hero",
            status: "ACTIVE",
            sort: 999,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Banner);

    console.log("✅ Fallback banner loaded:", fallbackBanner.title);

    return { ok: true as const, data: [fallbackBanner] };
  } catch (error) {
    console.error("Failed to fetch banners:", error);

    // 🔁 Final fallback (static backup)
    const staticFallback: Banner = {
      _id: "fallback-static",
      title: "Shop Smarter with Amar Shop",
      subtitle: "Exclusive discounts all year round",
      discount: "10%",
      image:
        "https://res.cloudinary.com/dtges64tg/image/upload/v1762064800/Amarshop_static_fallback.webp",
      position: "hero",
      status: "ACTIVE",
      sort: 999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { ok: true as const, data: [staticFallback] };
  }
}
