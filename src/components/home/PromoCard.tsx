"use client";
import Link from "next/link";

import { memo, useState, useEffect } from "react";
import { useGetCategoriesQuery } from "@/services/catalog.api";

interface PromoCardProps {
  href: string;
  className?: string;
}

function PromoCardBase({ href, className = "" }: PromoCardProps) {
  const isSurgical = href.includes("surgical");
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];
  
  const categorySlug = isSurgical ? "surgical" : "medicine";
  const category = categories.find(cat => cat.slug === categorySlug);
  const categoryImage = category?.image;

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${className}
        ${isSurgical ? "bg-linear-to-br from-orange-400 to-orange-600" : "bg-linear-to-br from-blue-500 to-blue-700"}
      `}
    >
      {categoryImage && (
        <div className="absolute top-0 left-0 right-0 h-12 md:h-2/3">
          <img
            src={categoryImage}
            alt={category.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="relative z-10 h-full flex flex-col">
        <div className="h-12 md:flex-1"></div>
        <div className="p-2 md:p-3">
          <p className="text-white text-[10px] md:text-xs font-medium leading-tight text-center">
            {isSurgical
              ? "Surgical (সার্জিক্যাল) পণ্য অর্ডার করতে এখানে Click করুন"
              : "Medicine (ঔষধ) পণ্য অর্ডার করতে এখানে Click করুন"}
          </p>
        </div>
      </div>
    </Link>
  );
}
export const PromoCard = memo(PromoCardBase);
