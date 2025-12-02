
// import type { Banner } from "@/types/banner";

// type BannerResp = { ok: boolean; data: Banner[] };

// export const bannerApi = baseApi.injectEndpoints({
//   endpoints: (build) => ({
//     getHeroBanners: build.query<Banner[], number | void>({
//       query: (limit = 6) => ({
//         url: "/banners",
//         params: { position: "hero", limit },
//       }),
//       transformResponse: (res: BannerResp) => res.data,
//       keepUnusedDataFor: 60,
//       providesTags: [{ type: "Banner" as const, id: "HERO" }],
//     }),
//   }),
// });

// export const { useGetHeroBannersQuery } = bannerApi;
