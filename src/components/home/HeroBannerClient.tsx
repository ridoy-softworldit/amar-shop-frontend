"use client";

import { BannerCarousel } from "./BannerCarousel";
import { useGetHeroBannersQuery } from "@/services/catalog.api";

export default function HeroBannerClient({
  limit = 6,
  heightClass,
}: {
  limit?: number;
  heightClass?: string;
}) {
  const { data, isFetching, isError } = useGetHeroBannersQuery(limit, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
    pollingInterval: 0,
  });

  // যদি API খালি/ফেইল করে, BannerCarousel নিজেই FALLBACK ইমেজ দেখাবে
  const items = data ?? [];

  return <BannerCarousel items={items} heightClass={heightClass} />;
}
