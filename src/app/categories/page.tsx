"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Sparkles, ArrowRight } from "lucide-react";
import { useGetCategoriesQuery } from "@/services/catalog.api";

export default function CategoriesPage() {
  const { data, isLoading, isError } = useGetCategoriesQuery();
  const categories = data?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cyan-50">
        <div className="animate-spin mb-4">
          <Sparkles className="w-8 h-8 text-cyan-600" />
        </div>
        <p className="text-cyan-600 text-sm font-medium">
          Loading categories...
        </p>
      </div>
    );
  }

  if (isError || categories.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-cyan-50">
        <div className="text-4xl mb-2">😔</div>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#167389] mb-1">
          No categories found
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          We’re updating our product catalog. Please check back soon!
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
      {/* ===== Header ===== */}
      <div className="text-center mb-10 sm:mb-14">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#167389] mb-3"
        >
          Shop by Categories
        </motion.h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
          Discover all our medical, surgical, and beauty product categories in
          one place. Click on any to explore products instantly.
        </p>
      </div>

      {/* ===== Categories Grid ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
      >
        {categories.map((cat, index) => (
          <motion.div
            key={cat._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white rounded-2xl border border-cyan-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer overflow-hidden h-48 sm:h-56"
          >
            <Link
              href={`/category/${encodeURIComponent(cat.slug)}`}
              className="relative block h-full"
            >
              <div className="absolute inset-0 bg-gray-50 flex items-center justify-center p-2" style={{ bottom: '60px' }}>
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.title}
                    style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
                  />
                ) : (
                  <Sparkles className="w-12 h-12 text-cyan-600" />
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-white p-2" style={{ height: '60px' }}>
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 text-center leading-tight mb-2">
                  {cat.title}
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
