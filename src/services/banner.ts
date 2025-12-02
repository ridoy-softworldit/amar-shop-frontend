
import { API } from "@/lib/api";
import type { Banner } from "@/types/banner";

type CreateBannerDTO = {
  image: string;
  title?: string;
  subtitle?: string;
  discount?: string;
  status?: "ACTIVE" | "HIDDEN";
  sort?: number;
  position?: "hero" | "side";
};

// Public (server/client-safe) — public list
// export async function getPublicBanners(params?: {
//   position?: "hero" | "side";
//   limit?: number;
// }) {
//   const u = new URL(`${API}/banners`);
//   if (params?.position) u.searchParams.set("position", params.position);
//   if (params?.limit) u.searchParams.set("limit", String(params.limit));
//   const res = await fetch(u.toString(), { next: { revalidate: 60 } }); // SSR cache: 60s
//   const json = await res.json();
//   if (!res.ok || json?.ok === false)
//     throw new Error(json?.message || "Failed to load banners");
//   return json.data as Banner[];
// }

// ----- Admin side (client) -----
function authFetch(input: string, init: RequestInit = {}) {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
    null;
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers, credentials: "include" });
}

export async function createAdminBanner(body: CreateBannerDTO) {
  const res = await authFetch(`${API}/admin/banners`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json?.ok === false)
    throw new Error(json?.message || "Create failed");
  return json.data as { id: string };
}

export async function listAdminBanners() {
  const res = await authFetch(`${API}/admin/banners`, { method: "GET" });
  const json = await res.json();
  if (!res.ok || json?.ok === false)
    throw new Error(json?.message || "Load failed");
  return json.data as (Banner & { id: string })[];
}

export async function deleteAdminBanner(id: string) {
  const res = await authFetch(`${API}/admin/banners/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || json?.ok === false)
    throw new Error(json?.message || "Delete failed");
  return true;
}

export async function updateAdminBanner(
  id: string,
  body: Partial<CreateBannerDTO>
) {
  const res = await authFetch(`${API}/admin/banners/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json?.ok === false)
    throw new Error(json?.message || "Update failed");
  return true;
}
