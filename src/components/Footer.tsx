"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";
import { SiTiktok, SiFacebook, SiInstagram, SiYoutube } from "react-icons/si"; 
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const brand = process.env.NEXT_PUBLIC_BRAND || "Amaar Shop";
  const hotline = process.env.NEXT_PUBLIC_HOTLINE || "+8801318319610";

  return (
    <footer
      role="contentinfo"
      className="bg-gradient-to-b bg-[#FFFCFD] text-black mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-12">
          {/* Brand Column */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* ✅ Added logo image (favicon.ico) */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-md">
                <Image
                  src="/favicon.ico"
                  alt={`${brand} Logo`}
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold truncate">
                  {brand} <br /> আমার শপ
                </h3>
              </div>
            </div>

            <p className="text-black text-sm leading-relaxed mb-4 text-pretty">
              Your trusted destination for authentic Surgical and cosmetics
              products. Bringing premium quality and radiant beauty to your
              doorstep.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#167389]">
              <Heart className="w-4 h-4 fill-pink-300" aria-hidden="true" />
              <span className="text-pretty">
                Health that inspires confidence
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1 h-5 sm:h-6 bg-[#167389] rounded-full"></span>
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/profile"
                  className="hover:text-[#167389] hover:pl-2 transition-all duration-200 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
                  title="Dashboard"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-[#167389] hover:pl-2 transition-all duration-200 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
                  title="Products"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-[#167389] hover:pl-2 transition-all duration-200 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167389] rounded"
                  title="My Orders"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:text-[#167389] hover:pl-2 transition-all duration-200 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
                  title="Categories"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-[#167389] hover:pl-2 transition-all duration-200 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
                  title="Shopping Cart"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#167389] hover:pl-2 transition-all duration-200 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
                  title="About Us"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1 h-5 sm:h-6 rounded-full bg-[#167389]"></span>
              <span>Contact Us</span>
            </h4>
            <ul className="space-y-3 text-black text-sm">
              <li className="flex items-start gap-3">
                <MapPin
                  className="w-5 h-5 text-black  flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="break-words hover:text-[#167389]">
                  Dhaka, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone
                  className="w-5 h-5 text-black flex-shrink-0"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${hotline}`}
                  className="hover:text-[#167389] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
                  title="Call hotline"
                >
                  {hotline}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail
                  className="w-5 h-5 text-black flex-shrink-0"
                  aria-hidden="true"
                />
                <a
                  href="mailto:support@amarshop.com"
                  className="hover:text-[#167389] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded break-words"
                  title="Email support"
                >
                  amarshop2026@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Info */}
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1 h-5 sm:h-6 bg-pink-400 rounded-full"></span>
              <span>Connect With Us</span>
            </h4>

            <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1Ara58741x"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                aria-label="Facebook"
                title="Facebook"
              >
                <SiFacebook className="w-5 h-5 text-[#1877F2]" aria-hidden="true" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/amaarshopbd/?igsh=MTk5cWtmbzAyZTRyMQ%3D%3D#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                aria-label="Instagram"
                title="Instagram"
              >
                <SiInstagram className="w-5 h-5 text-[#E4405F]" aria-hidden="true" />
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@amaarshop1?_t=ZS-90tPDmEVWSY&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                aria-label="TikTok"
                title="TikTok"
              >
                <SiTiktok className="w-5 h-5 text-[#000000]" aria-hidden="true" />
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@amarshopb?si=oblM13m2Lo-NamLI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                aria-label="YouTube"
                title="YouTube"
              >
                <SiYoutube className="w-5 h-5 text-[#FF0000]" aria-hidden="true" />
              </a>
            </div>

            <div className="bg-[#167389] border border-[#167389] rounded-xl p-3.5 sm:p-4">
              <p className="text-[11px] sm:text-xs text-white mb-1.5 font-semibold">
                Customer Service
              </p>
              <p className="text-sm text-white">9 AM - 9 PM Daily</p>
              <p className="text-[11px] sm:text-xs text-white mt-1">
                Saturday - Thursday
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-black">
            <p className="text-center sm:text-left">
              © {currentYear}{" "}
              <span className="font-semibold text-[#167389]">{brand}</span>. All
              rights reserved.
            </p>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
                title="Privacy Policy"
              >
                Privacy Policy
              </Link>
              <span aria-hidden="true" className="text-pink-700">
                |
              </span>
              <Link
                href="/terms"
                className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
                title="Terms of Service"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
