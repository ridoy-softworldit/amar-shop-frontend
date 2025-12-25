"use client";

import Link from "next/link";
import Image from "next/image";
import {  useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";
import {
  Search,
  ShoppingCart,
  Phone,
  Menu,
  X,
  Sparkles,
  User,
  Link2,
  ListOrderedIcon,
  MessageCircleCodeIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Category } from "@/lib/schemas";

function TopbarLogout() {
  const { isAuthed, logout } = useAuth();

  if (!isAuthed) return null;

  return (
    <button
      onClick={logout}
      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition lg:px-3 lg:gap-1 lg:flex lg:items-center"
      aria-label="Logout"
    >
      <LogOut className="w-5 h-5 lg:w-4 lg:h-4" />
      <span className="hidden lg:inline text-sm font-medium">Logout</span>
    </button>
  );
}

function MobileCartButton({ cartCount }: { cartCount: number }) {
  return (
    <div className="flex justify-center">
      <Link
        href="/cart"
        className="flex flex-col items-center text-xs relative"
        aria-label="Cart"
      >
        <ShoppingCart className="w-8 h-8" />
        <span className="font-semibold">Bag</span>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}

export default function Topbar() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState<string>(sp.get("q") ?? "");
  const [cat, setCat] = useState<string>(sp.get("category") ?? "");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const cartItems = useCartStore((s) => s.items);
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const brand = process.env.NEXT_PUBLIC_BRAND || "Amaar Shop";
  const hotline = process.env.NEXT_PUBLIC_HOTLINE || "+8801318319610";
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE;

  const placeholders = [
    { icon: Sparkles, text: "Search by Image..." },
    { icon: Link2, text: "Search by Company Name..." },
    { icon: Search, text: "Search by product..." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    async function load() {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is missing");
        const res = await fetch(`${API_BASE}/categories`, {
          signal: ac.signal,
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok)
          throw new Error(`Failed to load categories (${res.status})`);
        const json = await res.json();
        setCategories((json?.data ?? []) as Category[]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setCategoriesError(err.message || "Failed to fetch categories");
          setCategories([]);
        }
      } finally {
        setCategoriesLoading(false);
      }
    }
    load();
    return () => ac.abort();
  }, [API_BASE]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const qTrim = q.trim();
    const params = new URLSearchParams();
    if (qTrim) params.set("q", qTrim);
    if (cat) params.set("category", cat);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ======= FIXED TOP NAVBAR ======= */}
      <header
        className={clsx(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-[#167389]/95 backdrop-blur-lg shadow-lg"
            : "bg-[#167389] border-b border-[#1a8ba5]"
        )}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 h-[120px] lg:h-[100px] pb-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3 md:gap-4 py-2.5 sm:py-3 md:py-4 ">
            {/* ✅ Left: Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 group"
              aria-label="Go to homepage"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center">
                <Image
                  src="/logo-amar-shop.jpg"
                  alt="Amar Shop Logo"
                  fill
                  sizes="(max-width:768px) 36px, 48px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col text-sm sm:text-base lg:text-lg font-bold text-white tracking-wide leading-tight">
                <h1>{brand}</h1>
                <p>আমার শপ</p>
              </div>
            </Link>

            {/* ✅ Center: Search (Desktop only) */}
            <form
              onSubmit={onSearch}
              className="hidden lg:flex items-center justify-center w-full"
            >
              <div className="relative flex w-full max-w-2xl items-stretch">
                {/* ✅ Camera Icon Added */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-cyan-600"
                  >
                    <path d="M23 19V7a2 2 0 0 0-2-2h-3.17a2 2 0 0 1-1.41-.59l-.83-.82A2 2 0 0 0 14.17 3H9.83a2 2 0 0 0-1.41.59l-.83.82A2 2 0 0 1 6.17 5H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2ZM12 9a4 4 0 1 1-4 4 4 4 0 0 1 4-4Z" />
                  </svg>
                </div>

                <input
                  placeholder={placeholders[placeholderIndex].text}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border-2 border-cyan-200 bg-white text-[#167389] placeholder:text-cyan-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40 text-sm"
                />

                <Search className="absolute bg-cyan-600 text-white right-0 top-1/2 -translate-y-1/2 w-8 p-2 rounded-r-full h-10 pointer-events-none" />
              </div>
            </form>

            {/* ✅ Right: Actions */}
            <div className="flex items-center justify-end gap-2">
              <div className="hidden lg:flex gap-2">
                <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm font-semibold transition">
                  বাংলা
                </button>
                <button className="px-3 py-1.5 bg-white text-cyan-600 rounded-md text-sm font-semibold">
                  English
                </button>
              </div>
              <Link href="/profile" aria-label="Profile">
                <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                  <User className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/cart" aria-label="Cart" className="relative">
                <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                  <ShoppingCart className="w-5 h-5" />
                </button>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
              <TopbarLogout />
              <a
                href={`tel:${hotline}`}
                className="md:hidden p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* ✅ Mobile Search & Language Buttons */}
          <div className="lg:hidden flex gap-2 mt-2">
            <form onSubmit={onSearch} className="flex-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-cyan-600"
                  >
                    <path d="M23 19V7a2 2 0 0 0-2-2h-3.17a2 2 0 0 1-1.41-.59l-.83-.82A2 2 0 0 0 14.17 3H9.83a2 2 0 0 0-1.41.59l-.83.82A2 2 0 0 1 6.17 5H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2ZM12 9a4 4 0 1 1-4 4 4 4 0 0 1 4-4Z" />
                  </svg>
                </div>
                <input
                  placeholder={placeholders[placeholderIndex].text}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border-2 border-cyan-200 bg-white text-[#167389] placeholder:text-cyan-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-cyan-600 text-white rounded-xl p-2 h-8 w-8 flex items-center justify-center"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
            <button className="px-1 py-2 bg-white/10 text-white border-2 border-white/20 rounded-md text-xs font-semibold whitespace-nowrap">
              বাংলা
            </button>
            <button className="px-1 py-2 bg-white text-cyan-600 border-2 border-white rounded-md text-xs font-semibold whitespace-nowrap">
              English
            </button>
          </div>
        </div>
      </header>

      {/* ======= MOBILE BOTTOM NAVBAR ======= */}

      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-5 items-center px-2 py-2 text-[#167389]">
          {/* LEFT: Categories */}
          <div className="flex justify-center">
            <button
              onClick={() => setMobileMenuOpen((s) => !s)}
              className="flex flex-col items-center text-xs"
              aria-label="Open categories"
            >
              <Menu className="w-8 h-8" />
              <span className="font-semibold">Categories</span>
            </button>
          </div>

          {/* LEFT: Cart */}
          <MobileCartButton cartCount={cartCount} />

          {/* CENTER: Logo */}
          <div className="flex justify-center">
            <Link
              href="/"
              aria-label="Home"
              className="bg-white rounded-full shadow-md p-2 border border-cyan-200 flex items-center justify-center -translate-y-6"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src="/logo-amar-shop.jpg"
                  alt="Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* RIGHT: Orders */}
          <div className="flex justify-center">
            <Link
              href="/orders"
              className="flex flex-col items-center text-xs"
              aria-label="Orders"
            >
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="currentColor"
                className="w-8 h-8"
              >
                <path d="M16.006 2.667C8.64 2.667 2.667 8.64 2.667 16.006c0 2.886.88 5.61 2.546 7.96L3.36 29.333l5.546-1.84a13.3 13.3 0 0 0 7.1 2.027c7.366 0 13.34-5.973 13.34-13.34 0-7.366-5.974-13.346-13.34-13.346Zm0 24.64c-2.4 0-4.747-.68-6.78-1.974l-.48-.294-3.293 1.08 1.08-3.294-.307-.48a11.06 11.06 0 0 1-1.68-5.8c0-6.12 4.973-11.093 11.093-11.093 6.113 0 11.093 4.973 11.093 11.093 0 6.113-4.98 11.093-11.093 11.093Zm6.213-8.286c-.334-.173-1.987-.973-2.293-1.093-.307-.107-.533-.16-.76.16-.227.32-.867 1.093-1.067 1.307-.187.213-.4.24-.734.08-.334-.173-1.4-.52-2.667-1.667a10.003 10.003 0 0 1-1.84-2.293c-.187-.32-.02-.493.147-.667.16-.16.334-.4.507-.6.173-.2.227-.347.334-.573.107-.227.053-.427-.027-.6-.08-.173-.76-1.827-1.04-2.493-.267-.64-.534-.547-.76-.56h-.653c-.227 0-.6.087-.92.427s-1.213 1.18-1.213 2.867 1.24 3.32 1.414 3.547c.173.227 2.44 3.733 5.907 5.227।827.36 1.467।573 1.967।733।827।267 1.573।227 2.167।147।667-.107 1.987-.813 2.273-1.6।28-.787।28-1.453।2-1.6-.067-.147-.28-.24-.614-.414Z" />
              </svg> */}
              <ListOrderedIcon></ListOrderedIcon>
              <span className="font-semibold">Order</span>
            </Link>
          </div>

          {/* RIGHT: Chat */}
          <div className="flex justify-center">
            <button
              onClick={() => setChatDrawerOpen(true)}
              className="flex flex-col items-center text-xs"
              aria-label="Open chat"
            >
              <MessageCircleCodeIcon />
              <span className="font-semibold">Chat</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ======= Chat Drawer ======= */}
      <AnimatePresence>
        {chatDrawerOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="fixed inset-x-0 bottom-0 z-60 bg-white rounded-t-2xl shadow-2xl"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#167389]">Chat with Us</h3>
              <button
                onClick={() => setChatDrawerOpen(false)}
                className="text-gray-500 hover:text-rose-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <a
                href="https://wa.me/YOUR_PHONE_NUMBER"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-lg font-semibold">WhatsApp</span>
              </a>
              <a
                href="https://m.me/YOUR_PAGE_USERNAME"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                </svg>
                <span className="text-lg font-semibold">Messenger</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======= Bottom Categories Sheet (Full Height, Same as DesktopSidebar) ======= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="fixed inset-0 z-60 bg-white rounded-t-2xl shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white z-10">
              <h3 className="text-lg font-semibold text-[#167389]">
                Shop by Categories
              </h3>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-rose-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className=" group h-[150px] rounded-md border border-gray-200 bg-white p-1 flex flex-col items-stretch justify-start hover:shadow-md hover:border-cyan-300 transition"
                >
                  <div className=" relative basis-[90%] rounded-md overflow-hidden bg-gray-50">
                    <Image
                      src={cat.images?.[0] || "/placeholder.png"}
                      alt={cat.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 30vw, 20vw"
                      // FIX: Add error handling for broken images
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <p className="basis-[10%] flex items-center justify-center text-[13px] font-semibold text-gray-800 text-center p-2  ">
                    {cat.title}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16 sm:h-[72px] md:h-20 lg:h-24" />
    </>
  );
}
