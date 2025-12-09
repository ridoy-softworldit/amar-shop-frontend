"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import { useGetManufacturersQuery } from "@/services/catalog.api";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileManufacturersGrid from "./MobileManufacturersGrid";

export default function ManufacturersSection() {
  const { data, isLoading } = useGetManufacturersQuery();
  const manufacturers = data?.data || [];
  const isMobile = useIsMobile();

  // Use mobile grid on mobile devices
  if (isMobile) {
    return <MobileManufacturersGrid />;
  }

  if (isLoading) {
    return (
      <section className="py-6 lg:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#167389]" />
              Manufacturers
            </h2>
            <p className="text-gray-600 text-sm lg:text-base mt-1">
              Discover products from trusted manufacturers
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-20"></div>
          ))}
        </div>
      </section>
    );
  }

  if (!manufacturers.length) return null;

  const displayManufacturers = manufacturers.slice(0, 8);

  return (
    <section className="py-6 lg:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#167389]" />
            Manufacturers
          </h2>
          <p className="text-gray-600 text-sm lg:text-base mt-1">
            Discover products from trusted manufacturers
          </p>
        </div>
        <Link
          href="/manufacturers"
          className="flex items-center gap-1 text-[#167389] hover:text-cyan-700 font-medium text-sm lg:text-base transition-colors"
        >
          See All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {displayManufacturers.map((manufacturer, index) => (
          <motion.div
            key={manufacturer._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/manufacturer/${manufacturer.slug}`}
              className="block bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md hover:border-[#167389] transition-all group"
            >
              <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-2 group-hover:bg-[#167389]/5 transition-colors">
                {manufacturer.image ? (
                  <Image
                    src={manufacturer.image}
                    alt={manufacturer.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-400 group-hover:text-[#167389] transition-colors" />
                )}
              </div>
              <h3 className="text-xs font-medium text-gray-700 text-center truncate group-hover:text-[#167389] transition-colors uppercase">
                {manufacturer.title.toUpperCase()}
              </h3>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}