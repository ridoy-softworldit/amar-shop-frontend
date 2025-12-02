"use client";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { memo } from "react";

interface PromoCardProps {
  href: string;
  className?: string;
}

function PromoCardBase({ href, className = "" }: PromoCardProps) {
  const isSurgical = href.includes("surgical");
  return (
    <Link
      href={href}
      className={` text-white text-center p-3 shadow-md transition rounded-md flex flex-col items-center justify-center ${className}
        ${isSurgical ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"}
      `}
    >
      <Sparkles size={20} className="text-white mb-1" />
      <h3 className="text-xs font-bold">Amaar Shop</h3>
      <p className="text-[10px] leading-tight mt-1">
        {isSurgical
          ? "সকল সার্জিক্যাল পণ্য"
          : "সকল ধরনের ঔষধ"}
      </p>
    </Link>
  );
}
export const PromoCard = memo(PromoCardBase);
