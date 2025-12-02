"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartPulse, Sparkles, ShieldCheck, Truck, Smile } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-cyan-50 text-[#167389]">
      {/* ✅ Hero Section */}
      <section className="relative flex flex-col items-center text-center px-6 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-cyan-600">Amaar Shop</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Your trusted destination for <strong>medical essentials</strong>,
            <strong> surgical equipment</strong>, and{" "}
            <strong>beauty & cosmetics</strong> — all in one place. We bring
            health, care, and confidence to your doorstep.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 relative w-full max-w-4xl h-60 sm:h-72 md:h-96"
        >
          <Image
            src="/logo-amar-shop.jpg"
            alt="Medical and Beauty Products"
            fill
            className="object-cover rounded-2xl shadow-md"
          />
          <div className="absolute inset-0 bg-cyan-900/20 rounded-2xl" />
        </motion.div>
      </section>

      {/* ✅ Our Mission */}
      <section className=" ml-4 px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/logo-amar-shop.jpg"
              alt="Our Mission"
              width={600}
              height={400}
              className="rounded-xl object-cover shadow-md"
            
            />
          </motion.div>
          <div className="ml-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#167389]">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              At <strong>Amaar Shop</strong>, our mission is to make
              healthcare products and self-care essentials easily accessible to
              everyone. We work with verified suppliers to deliver 100%
              authentic surgical, medical, and cosmetic items — safely, quickly,
              and affordably.
            </p>
          </div>
        </div>
      </section>

      {/* ✅ Why Choose Us */}
      <section className="px-6 py-20 bg-gradient-to-b from-cyan-50 to-white">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#167389] mb-12">
          Why Choose Us
        </h2>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            {
              icon: HeartPulse,
              title: "Medical-Grade Products",
              desc: "Trusted and certified products to ensure your health and safety.",
            },
            {
              icon: Sparkles,
              title: "Beauty & Confidence",
              desc: "Enhance your natural beauty with premium cosmetics & skincare.",
            },
            {
              icon: ShieldCheck,
              title: "Quality & Authenticity",
              desc: "All products verified from top manufacturers and brands.",
            },
            {
              icon: Truck,
              title: "Fast & Reliable Delivery",
              desc: "Quick nationwide delivery right to your doorstep.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6 hover:shadow-md transition-all"
            >
              <Icon className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2 text-[#167389]">
                {title}
              </h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✅ Customer Promise */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Smile className="w-10 h-10 mx-auto text-cyan-600 mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-[#167389] mb-4">
            Our Promise to You
          </h2>
          <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
            Whether you’re a healthcare professional or a beauty enthusiast, we
            promise to provide products that empower your confidence, health,
            and lifestyle. Your satisfaction and trust drive everything we do.
          </p>
          <Link
            href="/products"
            className="inline-block mt-8 px-6 py-3 bg-[#167389] text-white rounded-xl hover:bg-cyan-700 transition-all"
          >
            Explore Our Products
          </Link>
        </div>
      </section>

      {/* ✅ Footer Style CTA */}
      <footer className="bg-[#167389] text-white text-center py-8 mt-8">
        <p className="text-sm">
          © {new Date().getFullYear()} Amar Shop BD — Caring for your Health &
          Beauty 💙
        </p>
      </footer>
    </main>
  );
}
