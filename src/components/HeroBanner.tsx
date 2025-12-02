"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  _id: string;
  title: string;
  image: string;
  link?: string;
};

type Props = {
  banners?: Banner[];
};

export default function HeroBanner({ banners = [] }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners?.length)
    return (
      <div className="w-full h-[280px] md:h-[420px] bg-pink-50 flex items-center justify-center text-pink-400 rounded-xl shadow-inner">
        No banners available
      </div>
    );

  const prevSlide = () =>
    setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);

  return (
    <div className="relative w-full h-[280px] md:h-[420px] overflow-hidden rounded-2xl shadow-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={banners[current]._id}
          initial={{ opacity: 0.3, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Link
            href={banners[current].link || "#"}
            aria-label={banners[current].title}
          >
            <Image
              src={banners[current].image}
              alt={banners[current].title}
              fill
              priority
              className="object-cover"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-pink-200/30 via-rose-100/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* 🌷 Nav Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-rose-100 transition"
      >
        <ChevronLeft className="w-5 h-5 text-rose-600" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-rose-100 transition"
      >
        <ChevronRight className="w-5 h-5 text-rose-600" />
      </button>

      {/* dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              idx === current ? "bg-rose-500" : "bg-rose-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
