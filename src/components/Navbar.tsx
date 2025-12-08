"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Phone, Menu, X, Sparkles, User, LogOut } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  _id: string;
  title: string;
  slug: string;
}

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Zustand cart store
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchCategories();

    // Scroll listener for sticky navbar effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchCategories = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API}/categories`);
      const data = await response.json();
      setCategories(data.data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        role="navigation"
        aria-label="Main"
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded"
              aria-label="Home"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-9 h-9 sm:w-12 sm:h-12 bg-linear-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md"
              >
                <Sparkles
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </motion.div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-700 to-rose-600 truncate">
                  GlowBeauty
                </h1>
                <p className="text-[11px] sm:text-xs text-pink-600 font-medium -mt-1">
                  Beauty & Cosmetics
                </p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8"
              role="search"
              aria-label="Product search"
            >
              <div className="relative w-full">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for beauty products..."
                  autoComplete="off"
                  className="w-full pl-12 pr-32 py-2.5 lg:py-3 border-2 border-pink-200 rounded-full focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all text-sm lg:text-base"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by category"
                  className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm border-l-2 border-pink-200 bg-transparent focus:outline-none"
                >
                  <option value="">All</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                  title="Search"
                >
                  <Search size={16} aria-hidden="true" />
                </button>
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Call Button - Desktop */}
              <a
                href="tel:01700000000"
                className="hidden lg:flex items-center gap-2 bg-pink-100 px-3.5 py-2 rounded-full hover:bg-pink-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                title="Call Us"
              >
                <Phone size={18} className="text-pink-600" aria-hidden="true" />
                <span className="text-sm font-medium text-pink-700">
                  Call Us
                </span>
              </a>

              {/* Auth/Profile Button */}
              <AuthButton />

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2 sm:p-2.5 text-pink-600 hover:bg-pink-50 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                aria-label="Cart"
                title="Cart"
              >
                <ShoppingCart
                  size={22}
                  className="sm:w-6 sm:h-6"
                  aria-hidden="true"
                />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold"
                    aria-label={`${cartCount} items in cart`}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle menu"
                title="Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3 sm:pb-4">
            <form
              onSubmit={handleSearch}
              className="relative"
              role="search"
              aria-label="Product search mobile"
            >
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                autoComplete="off"
                className="w-full pl-12 pr-10 py-2.5 border-2 border-pink-200 rounded-full focus:outline-none focus:border-pink-500 transition-all text-sm"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-pink-500 text-white p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                title="Search"
              >
                <Search size={16} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        {/* Secondary Navigation - Categories */}
        <div className="hidden md:block bg-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex items-center justify-center gap-4 lg:gap-6 py-2.5 lg:py-3 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              role="menubar"
              aria-label="Categories"
            >
              <Link
                href="/products"
                className="whitespace-nowrap hover:text-yellow-300 transition-colors font-medium px-1.5"
                role="menuitem"
              >
                All Products
              </Link>
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="whitespace-nowrap hover:text-yellow-300 transition-colors font-medium px-1.5"
                  role="menuitem"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-pink-100 overflow-hidden"
            role="menu"
            aria-label="Mobile categories"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 hover:bg-pink-50 rounded-xl transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                role="menuitem"
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 hover:bg-pink-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                  role="menuitem"
                >
                  {category.title}
                </Link>
              ))}
              <a
                href="tel:01700000000"
                className="flex items-center gap-2 px-4 py-3 bg-pink-50 rounded-xl font-medium text-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                role="menuitem"
                title="Call Us"
              >
                <Phone size={18} aria-hidden="true" />
                <span>Call Us: 01700000000</span>
              </a>
              <MobileAuthSection onClose={() => setMobileMenuOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Mobile Auth Section Component
function MobileAuthSection({ onClose }: { onClose: () => void }) {
  const { user, isAuthed, logout } = useAuth();

  if (!isAuthed) {
    return (
      <Link
        href="/login"
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-3 bg-pink-100 rounded-xl font-medium text-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
        role="menuitem"
      >
        <User size={18} />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <div className="border-t border-pink-100 pt-2 mt-2 space-y-2">
      <div className="px-4 py-2 bg-green-50 rounded-xl border-2 border-green-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="relative">
            <User size={16} className="text-green-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
          </div>
          <span className="font-bold text-green-700 truncate">Logged in: {user?.name || "User"}</span>
        </div>
      </div>
      <Link
        href="/profile"
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-3 hover:bg-pink-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
        role="menuitem"
      >
        <User size={18} className="text-pink-600" />
        <span className="font-medium">My Profile</span>
      </Link>
      <Link
        href="/orders"
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-3 hover:bg-pink-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
        role="menuitem"
      >
        <ShoppingCart size={18} className="text-pink-600" />
        <span className="font-medium">My Orders</span>
      </Link>
      <button
        onClick={() => {
          onClose();
          logout();
        }}
        className="flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        role="menuitem"
      >
        <LogOut size={18} className="text-red-600" />
        <span className="font-medium text-red-700">Sign Out</span>
      </button>
    </div>
  );
}

// Auth Button Component
function AuthButton() {
  const { user, isAuthed, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-auth-dropdown]')) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  if (!isAuthed) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 bg-pink-100 px-3 py-2 rounded-full hover:bg-pink-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
        title="Sign In"
      >
        <User size={18} className="text-pink-600" />
        <span className="hidden sm:inline text-sm font-medium text-pink-700">Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative" data-auth-dropdown>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full hover:bg-green-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 border-2 border-green-300"
        title={user?.name || "Profile"}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <div className="relative">
          <User size={18} className="text-green-700" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <span className="hidden sm:inline text-sm font-bold text-green-700 max-w-20 truncate">
          {user?.name || "Profile"}
        </span>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-pink-100 py-2 z-50"
            role="menu"
          >
            <Link
              href="/profile"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-pink-50 transition-colors"
              role="menuitem"
            >
              <User size={16} className="text-pink-600" />
              <span className="text-sm font-medium text-gray-700">My Profile</span>
            </Link>
            <Link
              href="/orders"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-pink-50 transition-colors"
              role="menuitem"
            >
              <ShoppingCart size={16} className="text-pink-600" />
              <span className="text-sm font-medium text-gray-700">My Orders</span>
            </Link>
            <hr className="my-2 border-pink-100" />
            <button
              onClick={() => {
                setShowDropdown(false);
                logout();
              }}
              className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left"
              role="menuitem"
            >
              <LogOut size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-700">Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
