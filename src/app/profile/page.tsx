/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  User,
  MapPin,
  Sparkles,
  ChevronRight,
  LogOut,
  Edit,
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import OrderCard from "@/components/orders/OrderCard";
import type { Order } from "@/types/order";

type CustomerLocal = {
  name?: string;
  phone?: string;
  houseOrVillage?: string;
  roadOrPostOffice?: string;
  blockOrThana?: string;
  district?: string;
  address?: string;
};

export default function ProfilePage() {
  const { user, isAuthed, isHydrated, logout, token } = useAuth();
  const router = useRouter();
  
  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";

  const [profileData, setProfileData] = useState<any>(null);
  const [customer, setCustomer] = useState<CustomerLocal | null>(null);
  const [phone, setPhone] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthed) {
      router.push("/login");
    }
  }, [isAuthed, isHydrated, router]);

  useEffect(() => {
    if (isAuthed && token) {
      fetch(`${API}/customers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.ok && result.data) {
            setProfileData(result.data);
            if (result.data.phone) {
              setPhone(result.data.phone);
              loadOrders(result.data.phone);
            }
          }
        })
        .catch(() => {});
    }
  }, [isAuthed, token, API]);

  useEffect(() => {
    try {
      const keys = [
        "checkout_customer",
        "order_customer",
        "customer",
        "shipping_info",
      ];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw) as CustomerLocal;
          setCustomer(parsed);
          if (parsed?.phone && !phone) setPhone(parsed.phone);
          break;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const fullAddress = useMemo(() => {
    if (!customer) return "";
    if (customer.address) return customer.address;
    const parts = [
      customer.houseOrVillage,
      customer.roadOrPostOffice,
      customer.blockOrThana,
      customer.district,
    ]
      .map((x) => x?.trim())
      .filter(Boolean);
    return parts.join(", ");
  }, [customer]);

  const loadOrders = async (ph: string) => {
    if (!API) {
      setErr("API base URL missing (NEXT_PUBLIC_API_BASE_URL).");
      return;
    }
    if (!ph || ph.trim().length < 5) {
      setErr("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setErr(null);
    setOrders([]);
    try {
      const u1 = `${API}/orders?phone=${encodeURIComponent(ph)}`;
      const res1 = await fetch(u1, {
        cache: "no-store",
        headers: { "content-type": "application/json" },
      });

      let data: any;
      if (res1.ok) {
        data = await res1.json();
      } else {
        const u2 = `${API}/orders?customerPhone=${encodeURIComponent(ph)}`;
        const res2 = await fetch(u2, {
          cache: "no-store",
          headers: { "content-type": "application/json" },
        });
        if (!res2.ok) {
          throw new Error(
            `Failed to load orders (${res1.status}/${res2.status})`
          );
        }
        data = await res2.json();
      }

      const arr: Order[] = Array.isArray(data?.data?.items) 
        ? data.data.items 
        : (Array.isArray(data?.items) 
          ? data.items 
          : (Array.isArray(data?.data) ? data.data : []));
      arr.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      setOrders(arr);
   
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (API && phone && !orders.length && !loading) {
      loadOrders(phone);
    }
  }, [API, phone]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#167389]/70 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#167389] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 py-20 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sparkles className="text-[#167389]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#167389]">
              My Profile
            </h1>
          </div>

          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl border-2 border-cyan-200 text-[#167389] bg-white hover:bg-cyan-50"
          >
            Go to Orders Page <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-pink-100 flex items-center justify-center">
                <User className="text-[#167389]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Account</h2>
                <p className="text-sm text-gray-600">
                  View your info and orders
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">
                    {user?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">
                    {profileData?.phone || user?.phone || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-semibold text-gray-900 break-words">
                    {profileData?.address
                      ? [
                          profileData.address.houseOrVillage,
                          profileData.address.roadOrPostOffice,
                          profileData.address.blockOrThana,
                          profileData.address.district,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : user?.address || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href="/profile/edit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl bg-[#167389] text-white hover:brightness-110"
              >
                <Edit size={16} />
                Edit Profile
              </Link>
              <button
                onClick={logout}
                className="px-3 py-2 text-sm font-semibold rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900">Your Orders</h3>
            <p className="text-sm text-gray-600">
              Enter your phone number to view orders placed with it.
            </p>

            <form
              className="mt-4 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                loadOrders(phone.trim());
              }}
            >
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 017xxxxxxxx"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-cyan-200 bg-white text-[#167389] placeholder:text-cyan-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#167389] text-white font-bold hover:brightness-110"
                disabled={loading}
              >
                {loading ? "Loading…" : "Find Orders"}
              </button>
            </form>

            {err && (
              <div className="mt-3 text-sm text-rose-600 font-semibold">
                {err}
              </div>
            )}

            <div className="mt-5 space-y-4">
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="rounded-xl border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="mt-2 h-3 w-20 bg-gray-200 rounded" />
                    <div className="mt-4 h-20 bg-gray-100 rounded" />
                  </div>
                ))}

              {!loading && orders.length === 0 && !err && (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-600">
                  No orders found for this phone.
                </div>
              )}

              {!loading &&
                orders.slice(0, 3).map((o) => (
                  <OrderCard
                    key={o._id}
                    order={o}
                    onViewInvoice={(order) => {
                      window.location.href = `/invoices/guest/${order._id}`;
                    }}
                  />
                ))}
            </div>

            {!loading && orders.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#167389] text-white hover:brightness-110"
                >
                  Go to Orders Page
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
