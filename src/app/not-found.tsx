import Link from "next/link";
import { Sparkles, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 p-4 sm:p-6 lg:p-8">
      <div className="text-center max-w-md w-full">
        {/* Icon with animation */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 sm:p-8 shadow-xl border border-pink-100">
              <Sparkles
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-transparent bg-clip-text"
                style={{
                  fill: "url(#gradient)",
                  stroke: "url(#gradient)",
                  strokeWidth: 1,
                }}
              />
              <svg width="0" height="0">
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Error code */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 tracking-tight leading-none mb-2">
            404
          </h1>
          <div className="h-1 w-24 sm:w-32 mx-auto bg-gradient-to-r from-pink-400 via-purple-400 to-rose-400 rounded-full"></div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 px-4 leading-relaxed">
          Oops! The page you are looking for does not exist. It might have been
          moved or deleted.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#167389] to-[#167389] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Homepage
          </Link>

          <Link
            href="/products"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-[#167389] px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold hover:bg-pink-50 transition-all duration-300 shadow-md hover:shadow-lg border-2 border-pink-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            Browse Products
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 sm:mt-12 flex justify-center gap-2 opacity-50">
          <div
            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
