"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useGetManufacturersQuery } from "@/services/catalog.api";

export default function ManufacturersPage() {
  const { data, isLoading, isError } = useGetManufacturersQuery();
  const manufacturers = data?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cyan-50">
        <div className="animate-spin mb-4">
          <Sparkles className="w-8 h-8 text-cyan-600" />
        </div>
        <p className="text-cyan-600 text-sm font-medium">
          Loading manufacturers...
        </p>
      </div>
    );
  }

  if (isError || manufacturers.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-cyan-50">
        <div className="text-4xl mb-2">😔</div>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#167389] mb-1">
          No manufacturers found
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          We`&apos;`re updating our brand catalog. Please check back soon!
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-[#167389] text-white rounded-full hover:bg-cyan-700 transition-all"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-white to-cyan-50 px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-14">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#167389] mb-3"
        >
          Shop by Manufacturers
        </motion.h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
          Discover all our trusted brands and manufacturers in one place. 
          Click on any brand to explore their products instantly.
        </p>
      </div>

      {/* Manufacturers Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
      >
        {manufacturers.map((manufacturer, index) => (
          <motion.div
            key={manufacturer._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
          >
            <Link
              href={`/manufacturer/${encodeURIComponent(manufacturer.slug)}`}
              className="flex flex-col h-full"
            >
              <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 min-h-[120px] sm:min-h-[140px]">
                {manufacturer.image ? (
                  <img
                    src={manufacturer.image}
                    alt={manufacturer.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Sparkles className="w-12 h-12 text-cyan-600" />
                )}
              </div>

              <div className="bg-white p-3 border-t border-gray-100">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 text-center leading-tight mb-1">
                  {manufacturer.name}
                </h3>
                <div className="flex items-center justify-center gap-1 text-cyan-600 text-xs sm:text-sm font-medium">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}